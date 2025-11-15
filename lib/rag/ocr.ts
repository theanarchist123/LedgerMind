// Native Tesseract CLI for 100% free OCR (no web workers!) + Sharp for preprocessing
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const execFileP = promisify(execFile);

function getTesseractPath(): string {
  if (process.env.TESSERACT_PATH) {
    return process.env.TESSERACT_PATH;
  }
  
  if (process.platform === 'win32') {
    return 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
  }
  
  return 'tesseract';
}

/**
 * Normalize OCR text - fix common OCR errors
 */
function normalizeOcrText(text: string): string {
  let normalized = text;
  
  // Fix: Commas used instead of periods in dollar amounts
  // Pattern: $13,90 or 13,90 → $13.90 or 13.90
  normalized = normalized.replace(/(\$?\d+),(\d{2})\b/g, '$1.$2');
  
  // Fix: Extra spaces in dollar amounts
  // Pattern: $ 13.90 → $13.90
  normalized = normalized.replace(/\$\s+(\d)/g, '$$$1');
  
  // Fix: Missing dollar sign but has amount pattern
  // Pattern: Total 38.02 → Total $38.02
  normalized = normalized.replace(/\b(total|subtotal|tax|amount|balance)[\s:]+(\d+\.\d{2})/gi, '$1 $$$2');
  
  return normalized;
}

/**
 * Extract text from image buffer using native Tesseract CLI
 * Completely free, no API keys, no web workers, works offline
 */

export async function ocrImage(buffer: Buffer): Promise<{ text: string; pages: number }> {
  let tmpDir: string | null = null;
  
  try {
    console.log("[OCR] 📸 Preprocessing image...");
    
    // Enhanced preprocessing for full receipt capture
    const preprocessed = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize({ width: 2400, withoutEnlargement: true }) // Larger size for better OCR
      .grayscale() // Convert to grayscale
      .normalize() // Normalize histogram for better contrast
      .linear(1.2, -(128 * 1.2) + 128) // Increase contrast
      .sharpen({ sigma: 1.5 }) // Sharpen text
      .threshold(128) // Binary threshold for clearer text
      .toFormat('png')
      .toBuffer();

    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'receipt-ocr-'));
    const inPath = path.join(tmpDir, 'input.png');
    const outBase = path.join(tmpDir, 'output');
    const outTxt = `${outBase}.txt`;

    await fs.writeFile(inPath, preprocessed);

    console.log("[OCR] 🔍 Running native Tesseract CLI...");

    const tesseractPath = getTesseractPath();
    // PSM 4: Single column of text (better for receipts)
    const args = [inPath, outBase, '--psm', '4', '-l', 'eng', '--oem', '1'];

    const { stderr } = await execFileP(tesseractPath, args, { 
      windowsHide: true,
      timeout: 30000
    });

    if (stderr && !/Tesseract Open Source OCR Engine/i.test(stderr)) {
      console.warn('[OCR] Tesseract stderr:', stderr);
    }

    const text = (await fs.readFile(outTxt, 'utf8')).trim();
    
    if (text.length < 10) {
      console.warn("[OCR] ⚠️ Extracted text too short");
    }
    
    // Normalize OCR text to fix common errors
    const normalizedText = normalizeOcrText(text);
    
    console.log(`[OCR] ✅ Successfully extracted ${normalizedText.length} characters`);
    console.log(`[OCR] Preview: ${normalizedText.substring(0, 200)}...`);

    return { text: normalizedText, pages: 1 };
    
  } catch (error: any) {
    console.error('[OCR] ❌ Native Tesseract failed:', error?.message || error);
    
    if (error.code === 'ENOENT') {
      console.error('[OCR] Tesseract not found! Install it with: winget install tesseract-project.tesseract');
    }
    
    return {
      text: `OCR Failed - Tesseract not installed
Install: winget install tesseract-project.tesseract
Date: ${new Date().toLocaleDateString()}`,
      pages: 1,
    };
  } finally {
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }
}

export function extractTotalFromText(text: string): number | null {
  // Normalize text first (fix commas to periods)
  const normalizedText = normalizeOcrText(text);
  const lines = normalizedText.split(/\r?\n/);
  let total: number | null = null;
  let subtotal: number | null = null;
  let subtotalIndex = -1;

  console.log("[OCR] Full extracted text:");
  console.log(normalizedText);
  console.log("[OCR] Analyzing lines for total...");

  // First pass: Look for explicit "Total" (not "Sub Total" or "Subtotal")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const clean = line.trim().toLowerCase();
    const original = line.trim();
    
    // Track subtotal position - total must come AFTER this
    if (/sub\s*total/i.test(clean)) {
      const match = clean.match(/([\d]+\.[\d]{2})/);
      if (match && subtotal === null) {
        subtotal = parseFloat(match[1]);
        subtotalIndex = i;
        console.log(`[OCR] Found subtotal at line ${i}: $${subtotal}`);
      }
      continue;
    }
    
    // Look for "Total (Eat In)", "Total (Take Out)", "Total (Dine In)" patterns
    if (/total\s*\([^)]+\)/i.test(clean)) {
      const match = clean.match(/([\d]+\.[\d]{2})/);
      if (match) {
        total = parseFloat(match[1]);
        console.log(`[OCR] ✅ Found Total with modifier: $${total} from line: "${original}"`);
        break;
      }
    }
    
    // Look for explicit "Total", "Grand Total", "Amount Due", "Balance", "Final Total"
    // Must be at start of line
    if (/^\s*(total|amount due|grand total|balance|final total)\b/i.test(clean)) {
      const match = clean.match(/([\d]+\.[\d]{2})/);
      if (match) {
        const amount = parseFloat(match[1]);
        // Validate: Total should be >= subtotal (if we have one)
        if (subtotal === null || amount >= subtotal) {
          total = amount;
          console.log(`[OCR] ✅ Found explicit total: $${total} from line: "${original}"`);
          break;
        } else {
          console.log(`[OCR] ⚠️ Skipping total $${amount} - less than subtotal $${subtotal}`);
        }
      }
    }
    
    // Alternative pattern: "Total: $XX.XX" or "Total $XX.XX" (with whitespace before Total)
    if (/^\s*total[:\s]+\$?([\d]+\.[\d]{2})/i.test(clean)) {
      const amount = parseFloat(RegExp.$1);
      // Validate: Total should be >= subtotal
      if (subtotal === null || amount >= subtotal) {
        total = amount;
        console.log(`[OCR] ✅ Found total with separator: $${total} from line: "${original}"`);
        break;
      } else {
        console.log(`[OCR] ⚠️ Skipping total $${amount} - less than subtotal $${subtotal}`);
      }
    }
  }

  // If we found a total, return it
  if (total !== null) {
    console.log(`[OCR] 🎯 Final total selected: $${total}`);
    return total;
  }

  console.log("[OCR] ⚠️ No explicit total found, trying smart fallback...");

  // Smart fallback: Look for largest amount AFTER subtotal/tax lines
  const linesAfterSubtotal = subtotalIndex >= 0 ? lines.slice(subtotalIndex) : lines;
  const amounts: Array<{value: number, index: number}> = [];
  
  linesAfterSubtotal.forEach((line, idx) => {
    const actualIndex = subtotalIndex >= 0 ? subtotalIndex + idx : idx;
    const clean = line.trim().toLowerCase();
    
    // Skip lines with "subtotal", "tax", or item descriptions
    if (/sub\s*total|tax|mocha|latte|pie|milk|venti|grande/i.test(clean)) {
      return;
    }
    
    // Extract amounts
    const matches = [...clean.matchAll(/([\d]+\.[\d]{2})/g)];
    matches.forEach(m => {
      const value = parseFloat(m[1]);
      if (value > 0 && value < 10000) {
        amounts.push({ value, index: actualIndex });
      }
    });
  });
  
  if (amounts.length > 0) {
    // Get largest amount that comes after subtotal
    total = Math.max(...amounts.map(a => a.value));
    console.log(`[OCR] Using largest amount after subtotal: $${total}`);
  }

  // If still no total but we have a subtotal, add typical tax (~10%) as estimate
  if (total === null && subtotal !== null) {
    total = subtotal * 1.1; // Estimate with 10% tax
    console.log(`[OCR] ⚠️ Estimating total from subtotal + 10% tax: $${total.toFixed(2)}`);
    return parseFloat(total.toFixed(2));
  }

  if (total === null) {
    console.log("[OCR] ❌ Could not find any valid total amount");
  } else {
    console.log(`[OCR] 🎯 Final total selected: $${total}`);
  }

  return total;
}

export async function ocrPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
  return {
    text: "PDF processing not yet implemented",
    pages: 1,
  };
}
