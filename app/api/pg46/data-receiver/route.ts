import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PowerMetrics = {
  L1?: number | null
  L2?: number | null
  L3?: number | null
  kWh?: number | null
  P?: number | null
  Q?: number | null
  S?: number | null
  PF?: number | null
  THD?: number | null
  F?: number | null
}

type Pg46Payload = {
  device_id?: number | string
  before_meter_no?: string | null
  metrics_meter_no?: string | null
  record_time?: string
  before?: PowerMetrics
  metrics?: PowerMetrics
  [key: string]: unknown
}

type NextIdRow = RowDataPacket & {
  next_id: number
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function parseTimestamp(input?: string): string {
  if (!input) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  const d = new Date(input)
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid record_time format')
  }

  return d.toISOString().slice(0, 19).replace('T', ' ')
}

function extractPowerMetrics(body: Pg46Payload, section: 'before' | 'metrics'): PowerMetrics {
  const nested = body?.[section] || {}

  return {
    L1: toNullableNumber(nested.L1 ?? body?.[`${section}_L1`]),
    L2: toNullableNumber(nested.L2 ?? body?.[`${section}_L2`]),
    L3: toNullableNumber(nested.L3 ?? body?.[`${section}_L3`]),
    kWh: toNullableNumber(nested.kWh ?? body?.[`${section}_kWh`]),
    P: toNullableNumber(nested.P ?? body?.[`${section}_P`]),
    Q: toNullableNumber(nested.Q ?? body?.[`${section}_Q`]),
    S: toNullableNumber(nested.S ?? body?.[`${section}_S`]),
    PF: toNullableNumber(nested.PF ?? body?.[`${section}_PF`]),
    THD: toNullableNumber(nested.THD ?? body?.[`${section}_THD`]),
    F: toNullableNumber(nested.F ?? body?.[`${section}_F`])
  }
}

/**
 * POST /api/pg46/data-receiver
 * 
 * รับข้อมูลจาก Progress PG46 RS485 Power Meter
 * และบันทึกลงตาราง power_records
 * 
 * Request Body Format:
 * {
 *   "device_id": 1,
 *   "before_meter_no": "MTR001",
 *   "metrics_meter_no": "MTR002",
 *   "record_time": "2026-03-20T14:30:00",
 *   "before": {
 *     "L1": 220.5,
 *     "L2": 221.0,
 *     "L3": 219.8,
 *     "kWh": 1234.567,
 *     "P": 150.5,
 *     "Q": 50.2,
 *     "S": 158.7,
 *     "PF": 0.95,
 *     "THD": 2.1,
 *     "F": 50.0
 *   },
 *   "metrics": {
 *     "L1": 220.2,
 *     "L2": 220.8,
 *     "L3": 219.5,
 *     "kWh": 1000.234,
 *     "P": 120.3,
 *     "Q": 40.1,
 *     "S": 126.8,
 *     "PF": 0.95,
 *     "THD": 1.8,
 *     "F": 50.0
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Pg46Payload
    const {
      device_id,
      before_meter_no,
      metrics_meter_no,
      record_time
    } = body

    // Validate required fields
    const normalizedDeviceId = Number(device_id)
    if (!Number.isInteger(normalizedDeviceId) || normalizedDeviceId <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid required field: device_id (must be a positive integer)'
      }, { status: 400 })
    }

    const timestamp = parseTimestamp(record_time)
    const before = extractPowerMetrics(body, 'before')
    const metrics = extractPowerMetrics(body, 'metrics')

    // Insert data into power_records
    const insertQuery = `
      INSERT INTO power_records (
        id,
        device_id,
        before_meter_no,
        metrics_meter_no,
        record_time,
        before_L1, before_L2, before_L3, before_kWh, before_P, before_Q, before_S, before_PF, before_THD, before_F,
        metrics_L1, metrics_L2, metrics_L3, metrics_kWh, metrics_P, metrics_Q, metrics_S, metrics_PF, metrics_THD, metrics_F,
        created_by
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?
      )
    `

    let insertedId = 0
    let newRecordId = 0
    let inserted = false
    let attempts = 0

    while (!inserted && attempts < 3) {
      attempts += 1

      const [rows] = await pool.query<NextIdRow[]>('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM power_records')
      newRecordId = rows[0]?.next_id || 1

      const values = [
        newRecordId,
        normalizedDeviceId,
        before_meter_no ?? null,
        metrics_meter_no ?? null,
        timestamp,
        before.L1,
        before.L2,
        before.L3,
        before.kWh,
        before.P,
        before.Q,
        before.S,
        before.PF,
        before.THD,
        before.F,
        metrics.L1,
        metrics.L2,
        metrics.L3,
        metrics.kWh,
        metrics.P,
        metrics.Q,
        metrics.S,
        metrics.PF,
        metrics.THD,
        metrics.F,
        'PG46 RS485'
      ].map((value) => value ?? null)

      try {
        const [result] = await pool.execute<ResultSetHeader>(insertQuery, values)
        insertedId = result.insertId
        inserted = true
      } catch (insertError: unknown) {
        const err = insertError as { code?: string }
        if (err?.code === 'ER_DUP_ENTRY' && attempts < 3) {
          continue
        }
        throw insertError
      }
    }

    if (!inserted) {
      throw new Error('Failed to insert power record after retry')
    }

    // Calculate energy reduction (will be auto-calculated by MySQL GENERATED column)
    const energy_reduction = (before.kWh ?? 0) - (metrics.kWh ?? 0)
    const co2_reduction = energy_reduction * 0.5135

    console.log(`✅ PG46 Data saved: device_id=${normalizedDeviceId}, id=${newRecordId}, energy_reduction=${energy_reduction.toFixed(3)} kWh`)

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      data: {
        id: newRecordId,
        device_id: normalizedDeviceId,
        record_time: timestamp,
        energy_reduction: parseFloat(energy_reduction.toFixed(3)),
        co2_reduction: parseFloat(co2_reduction.toFixed(4)),
        inserted_id: insertedId
      }
    })

  } catch (error: unknown) {
    console.error('❌ PG46 data receiver error:', error)
    const message = error instanceof Error ? error.message : 'Failed to save data'
    const details = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({
      success: false,
      error: message,
      details
    }, { status: 500 })
  }
}

/**
 * GET /api/pg46/data-receiver
 * 
 * ทดสอบ endpoint และดูรูปแบบข้อมูลที่ต้องส่ง
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/pg46/data-receiver',
    method: 'POST',
    description: 'รับข้อมูลจาก Progress PG46 RS485 Power Meter และบันทึกลง power_records',
    example_request: {
      device_id: 1,
      before_meter_no: 'MTR001',
      metrics_meter_no: 'MTR002',
      record_time: '2026-03-20T14:30:00',
      before: {
        L1: 220.5,
        L2: 221.0,
        L3: 219.8,
        kWh: 1234.567,
        P: 150.5,
        Q: 50.2,
        S: 158.7,
        PF: 0.95,
        THD: 2.1,
        F: 50.0
      },
      metrics: {
        L1: 220.2,
        L2: 220.8,
        L3: 219.5,
        kWh: 1000.234,
        P: 120.3,
        Q: 40.1,
        S: 126.8,
        PF: 0.95,
        THD: 1.8,
        F: 50.0
      }
    },
    fields: {
      device_id: 'required - รหัสอุปกรณ์',
      before_meter_no: 'optional - เลขที่มิเตอร์ก่อน',
      metrics_meter_no: 'optional - เลขที่มิเตอร์หลัง',
      record_time: 'optional - เวลาบันทึก (ถ้าไม่ระบุจะใช้เวลาปัจจุบัน)',
      before: 'optional - ค่ากระแสไฟก่อนติดตั้ง K-Save',
      metrics: 'optional - ค่ากระแสไฟหลังติดตั้ง K-Save'
    },
    power_fields: {
      L1: 'แรงดันไฟฟ้า Phase 1 (V)',
      L2: 'แรงดันไฟฟ้า Phase 2 (V)',
      L3: 'แรงดันไฟฟ้า Phase 3 (V)',
      kWh: 'พลังงานสะสม (kWh)',
      P: 'กำลังไฟฟ้าจริง (kW)',
      Q: 'กำลังไฟฟ้ารีแอกทีฟ (kVAR)',
      S: 'กำลังไฟฟ้าปรากฏ (kVA)',
      PF: 'ค่าตัวประกอบกำลังไฟฟ้า (0-1)',
      THD: 'Total Harmonic Distortion (%)',
      F: 'ความถี่ (Hz)'
    }
  })
}
