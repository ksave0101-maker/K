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

    const users = await query(`
      SELECT "userID", "userName", "userPassword", "userFULLNAME"
      FROM users
      ORDER BY "userID" ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    const total = await query(`SELECT COUNT(*) as count FROM users`)
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
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
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

    const result = await query(`
      UPDATE users SET
        "userName" = $1,
        "userPassword" = $2,
        "userFULLNAME" = $3
      WHERE "userID" = $4
      RETURNING "userID", "userName", "userPassword", "userFULLNAME"
    `, [userName, userPassword || null, userFULLNAME || null, parseInt(userID)])

    if (result.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      user: result[0],
      message: 'User updated successfully'
    })

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

    const result = await query(`
      DELETE FROM users
      WHERE "userID" = $1
      RETURNING "userID", "userName"
    `, [parseInt(userID)])

    if (result.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      deleted: result[0],
      message: 'User deleted successfully'
    })

  } catch (err: any) {
    console.error('Failed to delete user:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
