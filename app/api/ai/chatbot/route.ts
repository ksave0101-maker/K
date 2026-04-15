import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI chatbot is not configured.',
          message: 'Sorry, AI assistant is currently unavailable. Please contact the administrator.',
        },
        { status: 503 }
      );
    }

    // Convert context from OpenAI format to Gemini format
    const history = context.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await sendChatMessage(message, history);

    if (response.error) {
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
      message: response.text,
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

export async function GET() {
  const isConfigured = !!process.env.GOOGLE_AI_API_KEY;

  return NextResponse.json({
    service: 'AI Chatbot (Gemini)',
    status: isConfigured ? 'available' : 'not configured',
    configured: isConfigured,
  });
}
