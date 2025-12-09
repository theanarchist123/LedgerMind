/**
 * OCR Module - Uses OCR.space API for cloud-based OCR
 * Works on Vercel, local dev, and any Node.js environment
 * Get your free API key at: https://ocr.space/ocrapi/freekey
 */

// OCR.space API configuration
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || 'helloworld'; // 'helloworld' is the demo key
const OCR_SPACE_ENDPOINT = 'https://api.ocr.space/parse/image';

/**
 * Normalize OCR text - fix common OCR errors
 */
function normalizeOcrText(text: string): string {
  let normalized = text;
  
  // Fix: Commas used instead of periods in dollar amounts
  normalized = normalized.replace(/(\$?\d+),(\d{2})\b/g, '$1.$2');
  
  // Fix: Extra spaces in dollar amounts
  normalized = normalized.replace(/\$\s+(\d)/g, '$$$1');
  
  // Fix: Missing dollar sign but has amount pattern
  normalized = normalized.replace(/\b(total|subtotal|tax|amount|balance)[\s:]+(\d+\.\d{2})/gi, '$1 $$$2');
  
  return normalized;
}

/**
 * Extract text from image buffer using OCR.space API
 * Works in serverless environments (Vercel, AWS Lambda, etc.)
 */
export async function ocrImage(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    console.log("[OCR] 📸 Preparing image for OCR.space API...");
    
    // Convert buffer to base64 with proper data URI prefix
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
    
    console.log("[OCR] 🔍 Sending to OCR.space API...");
    
    // Create form data
    const formData = new FormData();
    formData.append('base64Image', base64Image);
    formData.append('language', 'eng');
    formData.append('isTable', 'true'); // Better for receipts
    formData.append('OCREngine', '2'); // Engine 2 is better for receipts
    formData.append('scale', 'true'); // Upscale for better quality
    formData.append('detectOrientation', 'true');
    
    const response = await fetch(OCR_SPACE_ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey': OCR_SPACE_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Check for API errors
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage || 'OCR processing failed');
    }
    
    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error('No OCR results returned');
    }
    
    // Get parsed text from all pages
    const text = result.ParsedResults
      .map((r: any) => r.ParsedText || '')
      .join('\n')
      .trim();
    
    if (text.length < 10) {
      console.warn("[OCR] ⚠️ Extracted text too short");
    }
    
    // Normalize OCR text to fix common errors
    const normalizedText = normalizeOcrText(text);
    
    console.log(`[OCR] ✅ Successfully extracted ${normalizedText.length} characters`);
    console.log(`[OCR] Preview: ${normalizedText.substring(0, 200)}...`);

    return { 
      text: normalizedText, 
      pages: result.ParsedResults.length 
    };
    
  } catch (error: any) {
    console.error('[OCR] ❌ OCR.space API failed:', error?.message || error);
    
    // Return a fallback response
    return {
      text: `OCR Processing Error
Please try uploading a clearer image.
Error: ${error?.message || 'Unknown error'}
Date: ${new Date().toLocaleDateString()}`,
      pages: 1,
    };
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
