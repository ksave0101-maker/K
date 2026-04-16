import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-pool'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'missing_credentials' },
        { status: 400 }
      )
    }

    // ค้นหา user จากฐานข้อมูล (ตาราง user_list)
    const users = await query<any[]>(
      'SELECT userId, userName, password, typeID, name, email FROM user_list WHERE userName = ? LIMIT 1',
      [username]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'invalid_credentials' },
        { status: 401 }
      )
    }

    const user = users[0]

    // ตรวจสอบรหัสผ่าน (bcrypt -> MD5 -> plaintext)
    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
    } catch (e) {
      console.warn('bcrypt.compare threw in marketing-login, will try fallbacks', e)
      isPasswordValid = false
    }

    if (!isPasswordValid) {
      const md5Hash = crypto.createHash('md5').update(password).digest('hex')
      if (md5Hash === user.password) {
        isPasswordValid = true
      } else if (password === user.password) {
        isPasswordValid = true
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'invalid_credentials' },
        { status: 401 }
      )
    }

    // ตรวจสอบสิทธิ์: เฉพาะ Admin, Executive, M_Marketing, Marketing, pavinee, Branch Manager
    // typeID: 0 = Admin, 1 = Executive, 16 = M_Marketing, 17 = Marketing, 18 = pavinee, 19 = Branch Manager
    const allowedTypes = [0, 1, 16, 17, 18, 19]

    if (!allowedTypes.includes(user.typeID)) {
      return NextResponse.json(
        { success: false, error: 'no_permission' },
        { status: 403 }
      )
    }

    // ล็อกอินสำเร็จ - ส่งข้อมูล user กลับ (ไม่รวม password)
    console.log(`[marketing-login] success for ${user.userName} (id=${user.userId})`)
    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        userName: user.userName,
        typeID: user.typeID,
        name: user.name,
        email: user.email
      }
    })

  } catch (error: any) {
    console.error('Marketing login error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    )
  }
}
