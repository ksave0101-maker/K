import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const employeeId = formData.get('employeeId') as string

    if (!file) {
      return NextResponse.json({
        ok: false,
        error: 'No file uploaded'
      }, { status: 400 })
    }

    // Validate category
    const validCategories = ['contracts', 'education', 'id-cards', 'bank-accounts', 'resumes', 'certificates']
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        ok: false,
        error: 'Invalid category'
      }, { status: 400 })
    }

    // Get file extension
    const fileName = file.name
    const fileExt = path.extname(fileName)
    const timestamp = Date.now()
    const newFileName = `${category}_${employeeId || 'temp'}_${timestamp}${fileExt}`

    // Create directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'employees', category)
    await mkdir(uploadDir, { recursive: true })

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, newFileName)

    await writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `/uploads/employees/${category}/${newFileName}`

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileName: newFileName,
      originalName: fileName,
      size: file.size,
      category
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to upload file'
    }, { status: 500 })
  }
}
