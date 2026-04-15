import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// ตรวจสอบใบหน้าและบันทึกเวลาเข้า-ออกงาน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { faceDescriptor, type, imageUrl } = body // type = 'checkin' or 'checkout'

    if (!faceDescriptor || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing faceDescriptor or type' },
        { status: 400 }
      )
    }

    // ดึงข้อมูลใบหน้าที่ลงทะเบียนทั้งหมด
    const [faces] = await pool.execute<RowDataPacket[]>(
      `SELECT
        ef.id,
        ef.userId,
        ef.faceDescriptor,
        u.name,
        u.name_th,
        u.email,
        u.typeID
      FROM employee_faces ef
      INNER JOIN user_list u ON ef.userId = u.userId`
    )

    if (faces.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No registered faces found' },
        { status: 404 }
      )
    }

    // คำนวณ Euclidean distance กับทุกใบหน้าที่ลงทะเบียน
    let minDistance = Infinity
    let matchedFace: any = null

    for (const face of faces) {
      const registeredDescriptor = JSON.parse(face.faceDescriptor)
      const distance = euclideanDistance(faceDescriptor, registeredDescriptor)
      
      if (distance < minDistance) {
        minDistance = distance
        matchedFace = face
      }
    }

    // threshold สำหรับการยอมรับว่าเป็นคนเดียวกัน (ยิ่งน้อยยิ่งคล้าย)
    const threshold = 0.6

    if (minDistance > threshold) {
      return NextResponse.json(
        { success: false, message: 'Face not recognized', distance: minDistance },
        { status: 404 }
      )
    }

    // บันทึกเวลาเข้า-ออกงาน
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    if (type === 'checkin') {
      // เช็คว่ามีการเข้างานวันนี้แล้วหรือยัง
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM attendance_records WHERE userId = ? AND date = ?',
        [matchedFace.userId, today]
      )

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Already checked in today' },
          { status: 400 }
        )
      }

      // บันทึกเวลาเข้างาน
      await pool.execute<ResultSetHeader>(
        'INSERT INTO attendance_records (userId, checkInTime, checkInImage, date) VALUES (?, ?, ?, ?)',
        [matchedFace.userId, now, imageUrl, today]
      )
    } else if (type === 'checkout') {
      // เช็คว่ามีการเข้างานวันนี้หรือไม่
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id, checkOutTime FROM attendance_records WHERE userId = ? AND date = ?',
        [matchedFace.userId, today]
      )

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No check-in record found today' },
          { status: 400 }
        )
      }

      if (existing[0].checkOutTime) {
        return NextResponse.json(
          { success: false, message: 'Already checked out today' },
          { status: 400 }
        )
      }

      // อัพเดตเวลาออกงาน
      await pool.execute(
        'UPDATE attendance_records SET checkOutTime = ?, checkOutImage = ? WHERE id = ?',
        [now, imageUrl, existing[0].id]
      )
    }

    return NextResponse.json({
      success: true,
      message: type === 'checkin' ? 'Check-in successful' : 'Check-out successful',
      employee: {
        userId: matchedFace.userId,
        name: matchedFace.name,
        name_th: matchedFace.name_th,
        email: matchedFace.email,
        typeID: matchedFace.typeID
      },
      distance: minDistance,
      time: now
    })
  } catch (error: any) {
    console.error('Face verification error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

// คำนวณ Euclidean distance ระหว่าง 2 face descriptors
function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Descriptor dimensions must match')
  }
  
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2)
  }
  
  return Math.sqrt(sum)
}
