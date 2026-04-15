import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST() {
  try {
    // Create table to store real-time InfluxDB power data
    await query(`
      CREATE TABLE IF NOT EXISTS influx_power_data (
        id SERIAL PRIMARY KEY,

        -- Device identification
        device VARCHAR(100) NOT NULL,
        ksave_id VARCHAR(100),
        location VARCHAR(255),

        -- Timestamp from InfluxDB
        measurement_time TIMESTAMP NOT NULL,

        -- Unique constraint for device + time (to prevent duplicates)
        CONSTRAINT unique_device_time UNIQUE (device, measurement_time),

        -- Power Before (10 columns)
        before_l1 NUMERIC(10, 2),
        before_l2 NUMERIC(10, 2),
        before_l3 NUMERIC(10, 2),
        before_kwh NUMERIC(10, 3),
        before_p NUMERIC(10, 2),
        before_q NUMERIC(10, 2),
        before_s NUMERIC(10, 2),
        before_pf NUMERIC(5, 3),
        before_thd NUMERIC(5, 2),
        before_f NUMERIC(5, 2),

        -- Power Metrics (10 columns)
        metrics_l1 NUMERIC(10, 2),
        metrics_l2 NUMERIC(10, 2),
        metrics_l3 NUMERIC(10, 2),
        metrics_kwh NUMERIC(10, 3),
        metrics_p NUMERIC(10, 2),
        metrics_q NUMERIC(10, 2),
        metrics_s NUMERIC(10, 2),
        metrics_pf NUMERIC(5, 3),
        metrics_thd NUMERIC(5, 2),
        metrics_f NUMERIC(5, 2),

        -- Energy Reduction (ER)
        er NUMERIC(10, 2),

        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_influx_device ON influx_power_data(device)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_influx_ksave ON influx_power_data(ksave_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_influx_time ON influx_power_data(measurement_time DESC)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_influx_device_time ON influx_power_data(device, measurement_time DESC)
    `)

    // Create trigger function to auto-update updated_at timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_influx_power_data_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    // Drop existing trigger if exists and create new one
    await query(`
      DROP TRIGGER IF EXISTS trigger_update_influx_power_data_timestamp ON influx_power_data
    `)

    await query(`
      CREATE TRIGGER trigger_update_influx_power_data_timestamp
        BEFORE UPDATE ON influx_power_data
        FOR EACH ROW
        EXECUTE FUNCTION update_influx_power_data_timestamp()
    `)

    return NextResponse.json({
      ok: true,
      message: 'Table influx_power_data created successfully with indexes and triggers'
    })

  } catch (err: any) {
    console.error('Database initialization error:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || 'Unknown error'
    }, { status: 500 })
  }
}
