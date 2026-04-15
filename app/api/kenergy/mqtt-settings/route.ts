import { NextRequest, NextResponse } from 'next/server'
import { queryUser } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Simple password encryption using base64
 * TODO: Replace with proper AES-256 encryption for production
 */
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

function decryptPassword(encrypted: string): string {
  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

/**
 * GET /api/kenergy/mqtt-settings
 * ดึงการตั้งค่า MQTT (ไม่ return password จริง)
 * Query params:
 *   - userId: number
 *   - site: thailand | korea
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const site = searchParams.get('site') || 'thailand'

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 })
    }

    const settings = await queryUser(`
      SELECT host, port, username, topic, \`interval\`, updated_at
      FROM mqtt_settings
      WHERE user_id = ? AND site = ?
      LIMIT 1
    `, [userId, site])

    if (settings.length === 0) {
      // Return default settings
      return NextResponse.json({
        success: true,
        settings: {
          host: 'broker.example.com',
          port: 1883,
          username: '',
          password: '••••••',
          topic: '',
          interval: 30
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings[0],
        password: '••••••' // Never return actual password
      }
    })
  } catch (err: any) {
    console.error('MQTT settings GET error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch MQTT settings'
    }, { status: 500 })
  }
}

/**
 * PUT /api/kenergy/mqtt-settings
 * บันทึกการตั้งค่า MQTT
 * Body: {
 *   userId: number,
 *   site: string,
 *   host: string,
 *   port: number,
 *   username?: string,
 *   password?: string (will be encrypted),
 *   topic?: string,
 *   interval: number
 * }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, site, host, port, username, password, topic, interval } = body

    // Validate required fields
    if (!userId || !site || !host || !port) {
      return NextResponse.json({
        success: false,
        error: 'userId, site, host, and port are required'
      }, { status: 400 })
    }

    // Encrypt password if provided
    const encryptedPassword = password && password !== '••••••'
      ? encryptPassword(password)
      : null

    // Use INSERT ... ON DUPLICATE KEY UPDATE
    if (encryptedPassword) {
      await queryUser(`
        INSERT INTO mqtt_settings
          (user_id, site, host, port, username, password, topic, \`interval\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          host = VALUES(host),
          port = VALUES(port),
          username = VALUES(username),
          password = VALUES(password),
          topic = VALUES(topic),
          \`interval\` = VALUES(\`interval\`),
          updated_at = NOW()
      `, [userId, site, host, port, username || null, encryptedPassword, topic || null, interval || 30])
    } else {
      // Don't update password if it's masked
      await queryUser(`
        INSERT INTO mqtt_settings
          (user_id, site, host, port, username, password, topic, \`interval\`)
        VALUES (?, ?, ?, ?, ?, '', ?, ?)
        ON DUPLICATE KEY UPDATE
          host = VALUES(host),
          port = VALUES(port),
          username = VALUES(username),
          topic = VALUES(topic),
          \`interval\` = VALUES(\`interval\`),
          updated_at = NOW()
      `, [userId, site, host, port, username || null, topic || null, interval || 30])
    }

    return NextResponse.json({
      success: true,
      message: 'MQTT settings saved successfully'
    })
  } catch (err: any) {
    console.error('MQTT settings PUT error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to save MQTT settings'
    }, { status: 500 })
  }
}
