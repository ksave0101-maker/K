import { NextRequest, NextResponse } from 'next/server'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '@/lib/mysql'
import { DEFAULT_CHART_OF_ACCOUNTS } from '@/lib/accounting/chart-of-accounts-seed'

type ChartOfAccountRow = RowDataPacket & {
  id: number
  code: string
  name_th: string
  name_en: string | null
  account_type: string
  sub_type: string | null
  parent_code: string | null
  account_alias: string | null
  is_sub_account: number
  is_active: number
  department_split: string | null
  created_at: string | null
}

type CountRow = RowDataPacket & {
  count: number
}

const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : String(err)
const isDuplicateEntryError = (err: unknown) =>
  typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ER_DUP_ENTRY'

// GET - ดึงข้อมูลผังบัญชีทั้งหมด
export async function GET() {
  try {
    const [rows] = await pool.query<ChartOfAccountRow[]>(`
      SELECT
        id, code, name_th, name_en, account_type, sub_type,
        parent_code, account_alias, is_sub_account, is_active, department_split, created_at
      FROM acc_chart_of_accounts
      ORDER BY code
    `)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}

// POST - เพิ่มบัญชีใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body?.action === 'seed-default') {
      for (const account of DEFAULT_CHART_OF_ACCOUNTS) {
        await pool.query(
          `INSERT INTO acc_chart_of_accounts
           (code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, department_split)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name_th = VALUES(name_th),
             name_en = VALUES(name_en),
             account_type = VALUES(account_type),
             sub_type = VALUES(sub_type),
             parent_code = VALUES(parent_code),
             account_alias = VALUES(account_alias),
             is_sub_account = VALUES(is_sub_account),
             department_split = VALUES(department_split),
             is_active = 1`,
          [
            account.code,
            account.name_th,
            account.name_en || null,
            account.account_type,
            account.sub_type || null,
            account.parent_code || null,
            account.account_alias || null,
            account.is_sub_account || 0,
            account.department_split || 'N'
          ]
        )
      }

      return NextResponse.json({
        ok: true,
        message: `นำเข้าผังบัญชีมาตรฐานสำเร็จ ${DEFAULT_CHART_OF_ACCOUNTS.length} รายการ`,
        count: DEFAULT_CHART_OF_ACCOUNTS.length
      })
    }

    const { code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, department_split } = body

    if (!code || !name_th || !account_type) {
      return NextResponse.json(
        { ok: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน (เลขที่บัญชี, ชื่อไทย, ประเภท)' },
        { status: 400 }
      )
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO acc_chart_of_accounts
       (code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, department_split)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name_th, name_en || null, account_type, sub_type || null,
       parent_code || null, account_alias || null, is_sub_account || 0, department_split || 'N']
    )

    return NextResponse.json({
      ok: true,
      message: 'เพิ่มบัญชีสำเร็จ',
      id: result.insertId
    })
  } catch (err: unknown) {
    if (isDuplicateEntryError(err)) {
      return NextResponse.json(
        { ok: false, error: 'เลขที่บัญชีนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}

// PUT - แก้ไขบัญชี
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, is_active, department_split } = body

    if (!id || !code || !name_th || !account_type) {
      return NextResponse.json(
        { ok: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE acc_chart_of_accounts
       SET code = ?, name_th = ?, name_en = ?, account_type = ?, sub_type = ?,
           parent_code = ?, account_alias = ?, is_sub_account = ?, is_active = ?, department_split = ?
       WHERE id = ?`,
      [code, name_th, name_en || null, account_type, sub_type || null,
       parent_code || null, account_alias || null, is_sub_account || 0,
       is_active !== undefined ? is_active : 1, department_split || 'N', id]
    )

    return NextResponse.json({ ok: true, message: 'แก้ไขบัญชีสำเร็จ' })
  } catch (err: unknown) {
    if (isDuplicateEntryError(err)) {
      return NextResponse.json(
        { ok: false, error: 'เลขที่บัญชีนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}

// DELETE - ลบบัญชี
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'ไม่พบ ID ที่ต้องการลบ' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่ามีบัญชีลูกหรือไม่
    const [children] = await pool.query<CountRow[]>(
      'SELECT COUNT(*) as count FROM acc_chart_of_accounts WHERE parent_code = (SELECT code FROM acc_chart_of_accounts WHERE id = ?)',
      [id]
    )

    if (children[0].count > 0) {
      return NextResponse.json(
        { ok: false, error: 'ไม่สามารถลบได้ เนื่องจากมีบัญชีย่อยอยู่' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM acc_chart_of_accounts WHERE id = ?', [id])
    return NextResponse.json({ ok: true, message: 'ลบบัญชีสำเร็จ' })
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}
