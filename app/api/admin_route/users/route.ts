import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * GET /api/admin_route/users
 * Retrieve all users from PostgreSQL
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Use `user_list` (MySQL) table
    const users = await query(
      `SELECT userId AS userID, userName AS userName, password AS userPassword, name AS userFULLNAME
       FROM user_list
       ORDER BY userId ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    const total = await query(`SELECT COUNT(*) as count FROM user_list`) as Array<{ count?: number }>
    const totalCount = total[0]?.count || 0

    return NextResponse.json({
      ok: true,
      users: users,
      total: Number(totalCount),
      limit,
      offset
    })
  } catch (err: any) {
    console.error('Failed to fetch users:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

/**
 * PUT /api/admin_route/users?id=xxx
 * Update a user by userID
 */
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const userID = url.searchParams.get('id')

    if (!userID) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { userName, userPassword, userFULLNAME } = body

    if (!userName) {
      return NextResponse.json({
        ok: false,
        error: 'userName is required'
      }, { status: 400 })
    }

    // Update the MySQL `user_list` table and return the updated row
    await query(
      `UPDATE user_list SET userName = ?, password = ?, name = ? WHERE userId = ?`,
      [userName, userPassword || null, userFULLNAME || null, parseInt(userID)]
    )

    const updated = await query(
      `SELECT userId AS userID, userName AS userName, password AS userPassword, name AS userFULLNAME FROM user_list WHERE userId = ?`,
      [parseInt(userID)]
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, user: updated[0], message: 'User updated successfully' })

  } catch (err: any) {
    console.error('Failed to update user:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin_route/users?id=xxx
 * Delete a user by userID
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const userID = url.searchParams.get('id')

    if (!userID) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const result = await query(`DELETE FROM user_list WHERE userId = ?`, [parseInt(userID)]) as { affectedRows?: number }[]

    // result is OK even if no rows affected; check affected rows
    const affected = result[0]?.affectedRows || 0
    if (affected === 0) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, deleted: { userID: parseInt(userID) }, message: 'User deleted successfully' })

  } catch (err: any) {
    console.error('Failed to delete user:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
