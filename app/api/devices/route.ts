import { NextRequest, NextResponse } from 'next/server'
import { getAllDevices } from '@/lib/mysql-ksave'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    // Query from ksave.devices table
    const devices = await getAllDevices()

    return NextResponse.json({
      success: true,
      count: devices.length,
      devices: devices || []
    })

  } catch (error) {
    console.error('Get devices error:', error)

    // Return empty array on error to prevent UI from breaking
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch devices: ' + (error instanceof Error ? error.message : String(error)),
        devices: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
