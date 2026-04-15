import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import path from 'path'
import fs from 'fs/promises'

const BILLS_DIR = path.join(process.cwd(), 'data', 'bills')

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'No id' }, { status: 400 })

    const [rows]: any = await pool.query('SELECT image_path FROM acc_scanned_bills WHERE id = ?', [id])
    if (!rows[0]?.image_path) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })

    const filePath = path.join(BILLS_DIR, rows[0].image_path)
    const fileBuffer = await fs.readFile(filePath)
    const ext = rows[0].image_path.split('.').pop()?.toLowerCase() || 'jpg'
    const contentType = MIME[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
