import { NextResponse } from 'next/server'
import { fetchActivityFeed } from '@/lib/activity-feed'

export const dynamic = 'force-dynamic'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function GET() {
  try {
    const activities = await fetchActivityFeed(24)
    return NextResponse.json({ success: true, activities })
  } catch (error: unknown) {
    console.error('Activity API error:', error)
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
