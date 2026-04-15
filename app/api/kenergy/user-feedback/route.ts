import { NextRequest, NextResponse } from 'next/server'
import { queryUser } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BRANCH_KEYWORDS: Record<string, string[]> = {
  korea: ['korea', 'korean', '한국', '대한민국', '코리아', 'kr'],
  thailand: ['thailand', 'thai', 'ไทย', 'ประเทศไทย', 'th'],
  vietnam: ['vietnam', 'vietnamese', 'เวียดนาม', 'vn'],
  malaysia: ['malaysia', 'malay', 'มาเล', 'มาเลเซีย', 'my'],
  brunei: ['brunei', 'บรูไน', 'bn']
}

async function ensureFeedbackBranchColumn() {
  const rows = await queryUser(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'user_feedback'
       AND COLUMN_NAME = 'branch'`
  )

  const columnExists = Number((rows as any[])[0]?.count || 0) > 0
  if (!columnExists) {
    await queryUser(`ALTER TABLE user_feedback ADD COLUMN branch VARCHAR(50) DEFAULT NULL`)
  }
}

/**
 * POST /api/kenergy/user-feedback
 * บันทึก feedback จากผู้ใช้
 * Body: {
 *   userId?: number (optional for anonymous feedback)
 *   category: string (Suggestion | Bug Report | Feature Request | General Feedback)
 *   subject: string
 *   message: string
 *   rating: number (0-5)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    await ensureFeedbackBranchColumn()

    const body = await req.json()
    const { userId, category, subject, message, rating, branch } = body

    // Validate required fields
    if (!category || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: 'category, subject, and message are required'
      }, { status: 400 })
    }

    // Validate category
    const validCategories = ['Suggestion', 'Bug Report', 'Feature Request', 'General Feedback']
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        success: false,
        error: `category must be one of: ${validCategories.join(', ')}`
      }, { status: 400 })
    }

    // Validate rating
    const numRating = rating !== undefined ? Number(rating) : 0
    if (numRating < 0 || numRating > 5) {
      return NextResponse.json({
        success: false,
        error: 'rating must be between 0 and 5'
      }, { status: 400 })
    }

    // Insert feedback
    const result = await queryUser(`
      INSERT INTO user_feedback (user_id, category, subject, message, rating, branch, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId || null,
      category,
      subject,
      message,
      numRating,
      branch || null,
      userId ? `user_${userId}` : 'anonymous'
    ])

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: (result as any)[0]?.insertId
    })
  } catch (err: any) {
    console.error('User feedback API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to submit feedback'
    }, { status: 500 })
  }
}

/**
 * GET /api/kenergy/user-feedback
 * ดึง feedback ทั้งหมด (สำหรับ admin)
 * Query params:
 *   - status: Pending | Reviewed | Resolved
 *   - category: Suggestion | Bug Report | Feature Request | General Feedback
 */
export async function GET(req: NextRequest) {
  try {
    await ensureFeedbackBranchColumn()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const branch = (searchParams.get('branch') || '').toLowerCase()

    let sql = `
      SELECT
        f.id,
        f.user_id,
        f.category,
        f.subject,
        f.message,
        f.rating,
        f.branch,
        f.status,
        f.created_at,
        u.name as user_name,
        u.email as user_email
      FROM user_feedback f
      LEFT JOIN user_list u ON f.user_id = u.userId
      WHERE 1=1
    `
    const params: any[] = []

    if (status) {
      sql += ' AND f.status = ?'
      params.push(status)
    }

    if (category) {
      sql += ' AND f.category = ?'
      params.push(category)
    }

    if (branch && BRANCH_KEYWORDS[branch]) {
      const tokens = BRANCH_KEYWORDS[branch]
      const branchLikeConditions = tokens.map(() => '(f.subject LIKE ? OR f.message LIKE ? OR u.name LIKE ? OR u.email LIKE ?)').join(' OR ')

      sql += ` AND (LOWER(COALESCE(f.branch, '')) = ? OR (${branchLikeConditions}))`
      params.push(branch)

      tokens.forEach((token) => {
        const like = `%${token}%`
        params.push(like, like, like, like)
      })
    }

    sql += ' ORDER BY f.created_at DESC LIMIT 100'

    const feedbacks = await queryUser(sql, params)

    return NextResponse.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    })
  } catch (err: any) {
    console.error('Get feedback API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch feedback'
    }, { status: 500 })
  }
}
