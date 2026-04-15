import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/ai-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Allow larger body size for file uploads
export const maxDuration = 60; // 60 seconds timeout

/**
 * AI Document Analyzer API
 * 
 * POST /api/ai/analyze-document
 * 
 * Request body:
 * {
 *   text: string,
 *   analysisType?: 'summary' | 'extract' | 'categorize'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, analysisType = 'summary' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      );
    }

    if (!['summary', 'extract', 'categorize'].includes(analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysis type. Must be: summary, extract, or categorize' },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI document analyzer is not configured. Please add OPENAI_API_KEY to environment variables.',
        },
        { status: 503 }
      );
    }

    // Check text length (max ~4000 words for GPT-3.5)
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document is too long. Maximum 4000 words allowed.',
          wordCount,
        },
        { status: 400 }
      );
    }

    // Analyze the document
    const response = await analyzeDocument(text, analysisType as any);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: response.data,
      analysisType,
      wordCount,
      usage: response.usage,
    });

  } catch (error) {
    console.error('Document Analyzer API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  const isConfigured = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    service: 'AI Document Analyzer',
    status: isConfigured ? 'available' : 'not configured',
    configured: isConfigured,
    features: {
      summary: 'Generate document summaries',
      extract: 'Extract key information (dates, people, numbers, actions)',
      categorize: 'Categorize and classify documents',
    },
    limits: {
      maxWords: 4000,
      maxCharacters: 16000,
    },
  });
}
