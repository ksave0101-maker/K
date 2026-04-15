import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// ฟังก์ชันคำนวณระยะห่างระหว่าง face descriptors
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { faceDescriptor, imageUrl } = body

    if (!faceDescriptor) {
      return NextResponse.json(
        { ok: false, error: 'Missing face descriptor' },
        { status: 400 }
      )
    }

    // ดึงข้อมูลใบหน้าทั้งหมดจากฐานข้อมูล
    const [faces] = await pool.query<RowDataPacket[]>(`
      SELECT
        ef.userId,
        ef.faceDescriptor,
        u.name,
        u.name_th
      FROM employee_faces ef
      LEFT JOIN user_list u ON ef.userId = u.userId
    `)

    if (faces.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'No registered faces found'
      })
    }

    // หาใบหน้าที่ใกล้เคียงที่สุด
    let minDistance = Infinity
    let matchedUser: any = null

    for (const face of faces) {
      const storedDescriptor = JSON.parse(face.faceDescriptor)
      const distance = euclideanDistance(faceDescriptor, storedDescriptor)

      if (distance < minDistance) {
        minDistance = distance
        matchedUser = face
      }
    }

    // กำหนด threshold สำหรับการจับคู่ (ยิ่งน้อยยิ่งเหมือน)
    const MATCH_THRESHOLD = 0.6

    if (minDistance > MATCH_THRESHOLD) {
      return NextResponse.json({
        ok: false,
        error: 'Face not recognized',
        distance: minDistance
      })
    }

    // ตรวจสอบว่าวันนี้เช็คอินแล้วหรือยัง
    const today = new Date().toISOString().split('T')[0]
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id, checkInTime FROM attendance_records WHERE userId = ? AND date = ?',
      [matchedUser.userId, today]
    )

    if (existing.length > 0 && existing[0].checkInTime) {
      return NextResponse.json({
        ok: false,
        error: 'Already checked in today',
        userId: matchedUser.userId,
        name: matchedUser.name_th || matchedUser.name,
        checkInTime: existing[0].checkInTime
      })
    }

    const checkInTime = new Date()

    if (existing.length > 0) {
      // อัพเดตเวลาเข้างาน
      await pool.query(
        'UPDATE attendance_records SET checkInTime = ?, checkInImage = ? WHERE id = ?',
        [checkInTime, imageUrl, existing[0].id]
      )
    } else {
      // สร้างข้อมูลใหม่
      await pool.query(
        'INSERT INTO attendance_records (userId, checkInTime, checkInImage, date) VALUES (?, ?, ?, ?)',
        [matchedUser.userId, checkInTime, imageUrl, today]
      )
    }

    return NextResponse.json({
      ok: true,
      userId: matchedUser.userId,
      name: matchedUser.name_th || matchedUser.name,
      checkInTime: checkInTime,
      matchDistance: minDistance
    })
  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
