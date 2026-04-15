import { NextRequest, NextResponse } from 'next/server';

/**
 * API Endpoint for File Translation
 * 
 * Packages installed:
 * - @google-cloud/translate (Translation API)
 * - pdf-lib (PDF creation)
 * - pdf-parse (PDF text extraction)
 * 
 * For production, you'll also need:
 * - Google Cloud Translation API credentials
 * - Set environment variable: GOOGLE_APPLICATION_CREDENTIALS
 */

import { v2 } from '@google-cloud/translate';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const { Translate } = v2;

interface TranslationRequest {
  targetLanguage: string;
  fileName: string;
  fileType: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetLanguage = formData.get('targetLanguage') as string;
    const useAI = formData.get('useAI') === 'true'; // Optional: use AI translation

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language not specified' },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file type
    const fileType = file.type;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    console.log(`Processing file: ${fileName}, Type: ${fileType}, Language: ${targetLanguage}, AI: ${useAI}`);

    // Route to appropriate handler based on file type
    let translatedFile: Buffer;
    let outputFileName: string;

    if (fileType === 'text/plain' || fileExtension === 'txt') {
      // Handle text files
      const result = await translateTextFile(buffer, targetLanguage, fileName, useAI);
      translatedFile = result.buffer;
      outputFileName = result.fileName;
    } 
    else if (fileType === 'application/pdf' || fileExtension === 'pdf') {
      // Handle PDF files
      const result = await translatePdfFile(buffer, targetLanguage, fileName, useAI);
      translatedFile = result.buffer;
      outputFileName = result.fileName;
    }
    else if (fileType.startsWith('image/')) {
      // Handle image files
      const result = await translateImageFile(buffer, targetLanguage, fileName, fileType, useAI);
      translatedFile = result.buffer;
      outputFileName = result.fileName;
    }
    else {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 400 }
      );
    }

    // Encode filename for Content-Disposition header (support Unicode characters)
    const encodedFileName = encodeURIComponent(outputFileName);
    const contentDisposition = `attachment; filename="${outputFileName.replace(/[^\x00-\x7F]/g, '_')}"; filename*=UTF-8''${encodedFileName}`;

    // Return translated file
    return new NextResponse(translatedFile as any, {
      status: 200,
      headers: {
        'Content-Type': fileType,
        'Content-Disposition': contentDisposition,
      },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Translate text file content
 */
async function translateTextFile(
  buffer: Buffer, 
  targetLanguage: string,
  fileName: string,
  useAI: boolean = false
): Promise<{ buffer: Buffer; fileName: string }> {
  
  try {
    // Read original text
    const originalText = buffer.toString('utf-8');
    
    // Translate text
    const translatedText = await translateText(originalText, targetLanguage, useAI);
    
    // Create output filename
    const langCode = targetLanguage.toUpperCase();
    const outputFileName = fileName.replace(/\.txt$/i, `_${langCode}.txt`);
    
    // Return translated buffer
    return {
      buffer: Buffer.from(translatedText, 'utf-8'),
      fileName: outputFileName
    };
  } catch (error) {
    console.error('Text file translation error:', error);
    throw error;
  }
}

/**
 * Translate PDF file content
 * 
 * PRODUCTION IMPLEMENTATION:
 * 1. Extract text from PDF using pdf-parse
 * 2. Translate extracted text
 * 3. Create new PDF with translated text using pdf-lib
 * 4. Preserve original layout and formatting
 */
async function translatePdfFile(
  buffer: Buffer,
  targetLanguage: string,
  fileName: string,
  useAI: boolean = false
): Promise<{ buffer: Buffer; fileName: string }> {
  
  try {
    // 1. Extract text from PDF using dynamic import
    // pdf-parse exports PDFParse class
    const pdfParseModule = await import('pdf-parse');
    const { PDFParse } = pdfParseModule;
    
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text found in PDF');
    }
    
    console.log(`Extracted ${extractedText.length} characters from PDF`);
    
    // 2. Translate extracted text
    const translatedText = await translateText(extractedText, targetLanguage, useAI);
    
    // 3. Create new PDF with translated text
    const pdfDoc = await PDFDocument.create();
    
    // Set up font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.2;
    
    // Add pages with translated text
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - margin;
    
    // Split text into lines that fit the page width
    const maxWidth = width - (2 * margin);
    const words = translatedText.split(/\s+/);
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth && currentLine) {
        // Draw current line
        page.drawText(currentLine, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        y -= lineHeight;
        currentLine = word;
        
        // Add new page if needed
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    // Draw last line
    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    // 4. Save PDF
    const pdfBytes = await pdfDoc.save();
    const langCode = targetLanguage.toUpperCase();
    const outputFileName = fileName.replace(/\.pdf$/i, `_${langCode}.pdf`);
    
    return {
      buffer: Buffer.from(pdfBytes),
      fileName: outputFileName
    };
    
  } catch (error) {
    console.error('PDF translation error:', error);
    
    // Fallback: Return demo text file
    const langCode = targetLanguage.toUpperCase();
    const outputFileName = fileName.replace(/\.pdf$/i, `_${langCode}.txt`);
    
    const errorText = `PDF Translation Error for: ${fileName}
Target Language: ${targetLanguage}

Error: ${error instanceof Error ? error.message : 'Unknown error'}

${error instanceof Error && error.message.includes('credentials') 
  ? `⚠️ Google Cloud credentials not configured.

To enable translation:
1. Create Google Cloud project
2. Enable Cloud Translation API
3. Create service account and download JSON key
4. Set environment variable:
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
5. Restart the server

For now, the original text has been extracted but not translated.
` 
  : `Please check the error message above and try again.`}
`;
    
    return {
      buffer: Buffer.from(errorText, 'utf-8'),
      fileName: outputFileName
    };
  }
}

/**
 * Translate image file content using OCR
 * 
 * IMPLEMENTATION:
 * 1. Extract text from image using OCR (Tesseract.js)
 * 2. Translate extracted text
 * 3. Create PDF with translated text
 */
async function translateImageFile(
  buffer: Buffer,
  targetLanguage: string,
  fileName: string,
  mimeType: string,
  useAI: boolean = false
): Promise<{ buffer: Buffer; fileName: string }> {
  
  try {
    console.log(`Processing image: ${fileName}`);
    
    // 1. Extract text from image using OCR
    const Tesseract = await import('tesseract.js');
    
    console.log('Running OCR on image...');
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text found in image');
    }
    
    console.log(`Extracted ${text.length} characters from image`);
    
    // 2. Translate extracted text
    const translatedText = await translateText(text, targetLanguage, useAI);
    
    // 3. Create PDF with translated text
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.2;
    
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - margin;
    
    // Add header
    const header = `Image Translation: ${fileName}\n`;
    page.drawText(header, {
      x: margin,
      y: y,
      size: 14,
      font: font,
      color: rgb(0, 0, 0.5),
    });
    y -= lineHeight * 2;
    
    // Split text into lines that fit the page width
    const maxWidth = width - (2 * margin);
    const words = translatedText.split(/\s+/);
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth && currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        y -= lineHeight;
        currentLine = word;
        
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const langCode = targetLanguage.toUpperCase();
    const outputFileName = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, `_${langCode}.pdf`);
    
    return {
      buffer: Buffer.from(pdfBytes),
      fileName: outputFileName
    };
    
  } catch (error) {
    console.error('Image translation error:', error);
    
    // Fallback: Return text file with error info
    const langCode = targetLanguage.toUpperCase();
    const outputFileName = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, `_${langCode}.txt`);
    
    const errorText = `Image Translation Error for: ${fileName}
Target Language: ${targetLanguage}
MIME Type: ${mimeType}

Error: ${error instanceof Error ? error.message : 'Unknown error'}

${error instanceof Error && error.message.includes('No text found') 
  ? `⚠️ No text detected in the image.
  
The image may:
- Contain no readable text
- Have low quality or resolution
- Use fonts that are difficult to recognize
- Require preprocessing (e.g., contrast adjustment)

Try uploading a clearer image or a document with more readable text.
`
  : error instanceof Error && error.message.includes('credentials')
  ? `⚠️ Google Cloud credentials not configured.

Translation services are not available. Please configure credentials.
`
  : `Please check the error message and try again.`}

File: ${fileName}
Size: ${(buffer.length / 1024).toFixed(2)} KB
Type: ${mimeType}
`;
    
    return {
      buffer: Buffer.from(errorText, 'utf-8'),
      fileName: outputFileName
    };
  }
}

/**
 * Translate text using Google Cloud Translation API
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create Google Cloud Project
 * 2. Enable Translation API
 * 3. Create service account and download credentials JSON
 * 4. Set environment variable:
 *    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
 * 5. Restart the server
 */
async function translateText(text: string, targetLanguage: string, useAI: boolean = false): Promise<string> {
  
  // Try AI translation first if enabled
  if (useAI && process.env.OPENAI_API_KEY) {
    try {
      console.log(`Using AI translation to ${targetLanguage}...`);
      const { translateWithAI } = await import('@/lib/ai-utils');
      const result = await translateWithAI(text, targetLanguage);
      
      if (result.success && result.data) {
        console.log('AI translation complete');
        return result.data;
      }
    } catch (aiError) {
      console.warn('AI translation failed, falling back to Google Translate:', aiError);
      // Continue to Google Translate
    }
  }
  
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('Google Cloud credentials not configured');
    }
    
    // Initialize Google Cloud Translation client
    const translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    
    // Map language codes to Google Cloud Translation API format
    const languageMap: Record<string, string> = {
      'th': 'th',    // Thai
      'zh': 'zh-CN', // Chinese Simplified
      'en': 'en',    // English
      'ko': 'ko',    // Korean
      'vi': 'vi',    // Vietnamese
      'ms': 'ms',    // Malay
    };
    
    const targetLang = languageMap[targetLanguage] || targetLanguage;
    
    console.log(`Translating ${text.length} characters to ${targetLang}...`);
    
    // Translate text
    const [translation] = await translate.translate(text, targetLang);
    
    console.log('Translation complete');
    return translation;
    
  } catch (error) {
    console.error('Translation API error:', error);
    
    // Fallback: Return text with translation header
    const languageNames: Record<string, string> = {
      'th': 'Thai (ไทย)',
      'zh': 'Chinese (中文)',
      'en': 'English',
      'ko': 'Korean (한국어)',
      'vi': 'Vietnamese (Tiếng Việt)',
      'ms': 'Malay (Bahasa Melayu)'
    };
    
    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    
    if (error instanceof Error && error.message.includes('credentials')) {
      return `[TRANSLATION NOT AVAILABLE - Please configure Google Cloud or OpenAI credentials]

⚠️ To enable translation:

Option 1: Google Cloud Translation (Recommended for bulk translation)
1. Create a Google Cloud project
2. Enable Cloud Translation API
3. Create service account and download credentials JSON
4. Set environment variable:
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"

Option 2: OpenAI GPT-4 (Better quality, more accurate)
1. Get OpenAI API key from https://platform.openai.com
2. Set environment variable:
   export OPENAI_API_KEY="your-key-here"

5. Restart the server

Target Language: ${targetLangName}

--- Original Text (Untranslated) ---
${text}
`;
    }
    
    return `[TRANSLATION ERROR]

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Target Language: ${targetLangName}

--- Original Text ---
${text}
`;
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Translation API is running',
    supportedLanguages: ['th', 'zh', 'en', 'ko', 'vi', 'ms'],
    supportedFormats: ['txt', 'pdf', 'jpg', 'jpeg', 'png', 'gif'],
    features: {
      txt: 'Full translation support',
      pdf: 'Text extraction + translation + PDF generation',
      images: 'OCR + translation + PDF generation'
    },
    note: 'Google Cloud Translation API credentials required for actual translation'
  });
}
