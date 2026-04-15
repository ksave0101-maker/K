import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// GET - Get all employee faces for comparison
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query(`
      SELECT
        ef.userId,
        ef.faceDescriptor,
        u.name,
        u.name_th
      FROM employee_faces ef
      JOIN user_list u ON ef.userId = u.userId
      WHERE u.site = 'Thailand'
    `)

    const faces = (rows as any[]).map(row => ({
      userId: row.userId,
      name: row.name,
      name_th: row.name_th,
      descriptor: JSON.parse(row.faceDescriptor)
    }))

    return NextResponse.json({
      ok: true,
      faces
    })

  } catch (error: any) {
    console.error('Error fetching faces:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to fetch faces'
    }, { status: 500 })
  }
}

// POST - Save employee face descriptor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, faceDescriptor, imageUrl } = body

    if (!userId || !faceDescriptor) {
      return NextResponse.json({
        ok: false,
        error: 'userId and faceDescriptor are required'
      }, { status: 400 })
    }

    // Check if face already exists
    const [existing] = await pool.query(
      'SELECT id FROM employee_faces WHERE userId = ?',
      [userId]
    )

    const descriptorStr = JSON.stringify(faceDescriptor)

    if ((existing as any[]).length > 0) {
      // Update existing face
      await pool.query(
        'UPDATE employee_faces SET faceDescriptor = ?, imageUrl = ? WHERE userId = ?',
        [descriptorStr, imageUrl || null, userId]
      )
    } else {
      // Insert new face
      await pool.query(
        'INSERT INTO employee_faces (userId, faceDescriptor, imageUrl) VALUES (?, ?, ?)',
        [userId, descriptorStr, imageUrl || null]
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'บันทึกข้อมูลใบหน้าสำเร็จ'
    })

  } catch (error: any) {
    console.error('Error saving face:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to save face'
    }, { status: 500 })
  }
}
