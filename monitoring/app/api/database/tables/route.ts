import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    if (!table) {
      // Return list of available tables
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      
      return NextResponse.json({ 
        success: true,
        tables: tables?.map((t: any) => t.table_name) || []
      })
    }

    // Validate table name to prevent SQL injection
    const validTables = [
      'users',
      'devices',
      'device_metrics',
      'device_latest_status',
      'user_sessions',
      'influx_power_data',
      'power_readings'  // ✅ Added power_readings table
    ]
    if (!validTables.includes(table)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      )
    }

    // Get table structure
    const columns = await query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [table])

    let data, countResult;
    if (table === 'influx_power_data') {
      // Filtering for influx_power_data
      const device = searchParams.get('device');
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      let where = [];
      let params = [];
      let idx = 1;
      if (device) {
        where.push(`device = $${idx++}`);
        params.push(device);
      }
      if (from) {
        where.push(`updated_at >= $${idx++}`);
        params.push(from);
      }
      if (to) {
        where.push(`updated_at <= $${idx++}`);
        params.push(to);
      }
      const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      data = await query(`SELECT * FROM "influx_power_data" ${whereClause} ORDER BY updated_at DESC LIMIT 100`, params);
      countResult = await query(`SELECT COUNT(*) as count FROM "influx_power_data" ${whereClause}`, params);
    } else {
      data = await query(`SELECT * FROM "${table}" ORDER BY 1 DESC LIMIT 100`);
      countResult = await query(`SELECT COUNT(*) as count FROM "${table}"`);
    }
    const totalRows = countResult?.[0]?.count || 0;

    return NextResponse.json({ 
      success: true,
      table,
      columns: columns || [],
      data: data || [],
      totalRows: Number(totalRows)
    })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Failed to query database: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
