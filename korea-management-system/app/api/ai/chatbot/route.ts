import { NextRequest, NextResponse } from 'next/server';
import { askAI, ChatMessage } from '@/lib/ai-utils';
import { AI_PROMPTS, AI_MODELS } from '@/lib/ai-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * AI Chatbot API
 * 
 * POST /api/ai/chatbot
 * 
 * Request body:
 * {
 *   message: string,
 *   context?: ChatMessage[],
 *   model?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context = [], model = AI_MODELS.GPT35 } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI chatbot is not configured. Please add OPENAI_API_KEY to environment variables.',
          message: 'Sorry, AI assistant is currently unavailable. Please contact the administrator.',
        },
        { status: 503 }
      );
    }

    // Call AI with chatbot prompt
    const response = await askAI(
      message,
      AI_PROMPTS.CHATBOT,
      context,
      model
    );

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error,
          message: 'Sorry, I encountered an error. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: response.data,
      usage: response.usage,
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Sorry, something went wrong. Please try again later.',
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
    service: 'AI Chatbot',
    status: isConfigured ? 'available' : 'not configured',
    configured: isConfigured,
    models: {
      default: AI_MODELS.GPT35,
      available: [AI_MODELS.GPT35, AI_MODELS.GPT35_16K, AI_MODELS.GPT4, AI_MODELS.GPT4_MINI],
    },
  });
}
