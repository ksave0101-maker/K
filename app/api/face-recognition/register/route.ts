import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// บันทึก face descriptor ของพนักงาน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, faceDescriptor, imageUrl } = body

    if (!userId || !faceDescriptor) {
      return NextResponse.json(
        { success: false, message: 'Missing userId or faceDescriptor' },
        { status: 400 }
      )
    }

    // ลบข้อมูลใบหน้าเก่า (ถ้ามี)
    await pool.execute(
      'DELETE FROM employee_faces WHERE userId = ?',
      [userId]
    )

    // บันทึกข้อมูลใบหน้าใหม่
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO employee_faces (userId, faceDescriptor, imageUrl) VALUES (?, ?, ?)',
      [userId, JSON.stringify(faceDescriptor), imageUrl]
    )

    return NextResponse.json({
      success: true,
      message: 'Face registered successfully',
      faceId: result.insertId
    })
  } catch (error: any) {
    console.error('Face registration error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to register face' },
      { status: 500 }
    )
  }
}

// ดึงข้อมูลใบหน้าที่ลงทะเบียนแล้วทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        ef.id,
        ef.userId,
        ef.faceDescriptor,
        ef.imageUrl,
        u.name,
        u.name_th,
        u.email
      FROM employee_faces ef
      INNER JOIN user_list u ON ef.userId = u.userId
      ORDER BY ef.created_at DESC`
    )

    const faces = rows.map(row => ({
      id: row.id,
      userId: row.userId,
      faceDescriptor: JSON.parse(row.faceDescriptor),
      imageUrl: row.imageUrl,
      name: row.name,
      name_th: row.name_th,
      email: row.email
    }))

    return NextResponse.json({
      success: true,
      faces
    })
  } catch (error: any) {
    console.error('Get faces error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get faces' },
      { status: 500 }
    )
  }
}
