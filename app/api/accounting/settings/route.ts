import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const key = new URL(req.url).searchParams.get('key')
    if (key) {
      const [rows]: any = await pool.query('SELECT * FROM acc_settings WHERE setting_key=?', [key])
      return NextResponse.json({ ok: true, data: rows[0] || null })
    }
    const [rows]: any = await pool.query('SELECT * FROM acc_settings ORDER BY setting_key')
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'INSERT INTO acc_settings (setting_key,setting_value,description) VALUES (?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),description=VALUES(description)',
      [b.setting_key, b.setting_value, b.description || null])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query('UPDATE acc_settings SET setting_value=?,description=? WHERE setting_key=?',
      [b.setting_value, b.description || null, b.setting_key])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_settings WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
