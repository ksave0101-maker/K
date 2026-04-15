import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { ok: false, error: 'Missing file or userId' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'faces')
    await mkdir(uploadDir, { recursive: true })

    // สร้างชื่อไฟล์ใหม่
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const newFileName = `user_${userId}_${timestamp}.${extension}`
    const filePath = path.join(uploadDir, newFileName)

    // บันทึกไฟล์
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/faces/${newFileName}`

    return NextResponse.json({
      ok: true,
      url: publicUrl
    })
  } catch (error: any) {
    console.error('Upload face image error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
