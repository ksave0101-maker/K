import { NextRequest, NextResponse } from 'next/server';
import { fixCode } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, errorMessage, language = 'typescript' } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    if (!errorMessage || typeof errorMessage !== 'string') {
      return NextResponse.json(
        { error: 'Error message is required and must be a string' },
        { status: 400 }
      );
    }

    const response = await fixCode(code, errorMessage, language);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fixedCode: response.text,
      status: 'success'
    });
  } catch (error: any) {
    console.error('Fix Code API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
