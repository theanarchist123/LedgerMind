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
    
    const preprocessed = await sharp(buffer)
      .rotate()
      .grayscale()
      .sharpen()
      .normalize()
      .resize({ width: 2000, withoutEnlargement: true })
      .toFormat('png')
      .toBuffer();

    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'receipt-ocr-'));
    const inPath = path.join(tmpDir, 'input.png');
    const outBase = path.join(tmpDir, 'output');
    const outTxt = `${outBase}.txt`;

    await fs.writeFile(inPath, preprocessed);

    console.log("[OCR] 🔍 Running native Tesseract CLI...");

    const tesseractPath = getTesseractPath();
    const args = [inPath, outBase, '--psm', '6', '-l', 'eng', '--oem', '1'];

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

  for (const line of lines) {
    const clean = line.trim().toLowerCase();
    
    if (/^(total|amount due|grand total|balance)\b/.test(clean)) {
      const match = clean.match(/([\d]+\.[\d]{2})/);
      if (match) {
        total = parseFloat(match[1]);
        break;
      }
    }
    
    if (/total[:\s]+([\d]+\.[\d]{2})/.test(clean)) {
      total = parseFloat(RegExp.$1);
      break;
    }
  }

  if (total === null) {
    const amounts = [...normalizedText.matchAll(/([\d]+\.[\d]{2})/g)]
      .map(m => parseFloat(m[1]))
      .filter(n => n > 0 && n < 10000);
    
    if (amounts.length > 0) {
      total = Math.max(...amounts);
    }
  }

  return total;
}

export async function ocrPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
  return {
    text: "PDF processing not yet implemented",
    pages: 1,
  };
}
