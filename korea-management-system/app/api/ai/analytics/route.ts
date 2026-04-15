import { NextRequest, NextResponse } from 'next/server';
import { generateInsights } from '@/lib/ai-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * AI Analytics API
 * 
 * POST /api/ai/analytics
 * 
 * Request body:
 * {
 *   dataDescription: string,
 *   dataPoints: any[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataDescription, dataPoints } = body;

    if (!dataDescription || typeof dataDescription !== 'string') {
      return NextResponse.json(
        { error: 'Data description is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
      return NextResponse.json(
        { error: 'Data points must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI analytics is not configured. Please add OPENAI_API_KEY to environment variables.',
        },
        { status: 503 }
      );
    }

    // Limit data points to avoid token limits
    const limitedDataPoints = dataPoints.slice(0, 50);
    if (dataPoints.length > 50) {
      console.warn(`Data points limited to 50 (original: ${dataPoints.length})`);
    }

    // Generate insights
    const response = await generateInsights(dataDescription, limitedDataPoints);

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
      insights: response.data,
      dataPointsAnalyzed: limitedDataPoints.length,
      usage: response.usage,
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
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
    service: 'AI Analytics',
    status: isConfigured ? 'available' : 'not configured',
    configured: isConfigured,
    capabilities: [
      'Trend analysis',
      'Pattern detection',
      'Risk identification',
      'Recommendations',
    ],
    limits: {
      maxDataPoints: 50,
    },
  });
}
