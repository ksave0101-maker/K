import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ksaveID, 
      deviceName,
      seriesName, 
      seriesNo, 
      powerValue, 
      location, 
      status, 
      secondsAgo, 
      reportingOk,
      ipAddress 
    } = body

    if (!ksaveID) {
      return NextResponse.json(
        { error: 'ksaveID is required' },
        { status: 400 }
      )
    }

    // Insert into device_metrics (history)
    await query(
      `INSERT INTO device_metrics 
       ("ksaveID", "seriesName", "seriesNo", "powerValue", "location", "status", "secondsAgo", "reportingOk") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [ksaveID, seriesName, seriesNo, powerValue, location, status, secondsAgo, reportingOk]
    )

    // Update latest status (upsert)
    await query(
      `INSERT INTO device_latest_status 
       ("ksaveID", "deviceName", "seriesName", "seriesNo", "powerValue", "location", "status", "secondsAgo", "reportingOk", "ipAddress", "lastUpdated") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       ON CONFLICT ("ksaveID") 
       DO UPDATE SET 
         "deviceName" = EXCLUDED."deviceName",
         "seriesName" = EXCLUDED."seriesName",
         "seriesNo" = EXCLUDED."seriesNo",
         "powerValue" = EXCLUDED."powerValue",
         "location" = EXCLUDED."location",
         "status" = EXCLUDED."status",
         "secondsAgo" = EXCLUDED."secondsAgo",
         "reportingOk" = EXCLUDED."reportingOk",
         "ipAddress" = EXCLUDED."ipAddress",
         "lastUpdated" = CURRENT_TIMESTAMP`,
      [ksaveID, deviceName, seriesName, seriesNo, powerValue, location, status, secondsAgo, reportingOk, ipAddress]
    )

    return NextResponse.json({ 
      success: true,
      message: 'Device metrics saved successfully'
    })
  } catch (error) {
    console.error('Save device metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to save metrics: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve latest device status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ksaveID = searchParams.get('ksaveID')

    let devices
    if (ksaveID) {
      devices = await query(
        'SELECT * FROM device_latest_status WHERE ksaveID = ?',
        [ksaveID]
      )
    } else {
      devices = await query(
        'SELECT * FROM device_latest_status ORDER BY lastUpdated DESC'
      )
    }

    return NextResponse.json({ 
      success: true,
      devices: devices || []
    })
  } catch (error) {
    console.error('Get device metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
