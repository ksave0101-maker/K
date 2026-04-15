import { NextResponse, NextRequest } from 'next/server'
import { insertCustomerContact } from '@/lib/mysql-customer'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}))
		const { name, email, phone, company, subject, message } = body || {}

		// Validate input
		if (!name || !email || !phone || !subject || !message) {
			return NextResponse.json({
				error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
			}, { status: 400 })
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json({
				error: 'รูปแบบอีเมลไม่ถูกต้อง'
			}, { status: 400 })
		}

		console.log('📧 New contact form submission:', {
			name,
			email,
			phone,
			company: company || 'N/A',
			subject
		})

		// Save to database (cus_detail table in customer database)
		try {
			const result = await insertCustomerContact({
				fullname: name,
				email,
				phone,
				company,
				subject,
				message,
				created_by: 'website_contact_form'
			})

			console.log('✅ Saved to database with cusID:', result.cusID)
		} catch (dbError: any) {
			console.error('❌ Database error:', dbError)
			return NextResponse.json({
				error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
			}, { status: 500 })
		}

		// Format message for chatbot/notification
		const chatbotMessage = formatChatbotMessage({
			name,
			email,
			phone,
			company,
			subject,
			message
		})

		console.log('💬 Chatbot message formatted:')
		console.log(chatbotMessage)

		// Optional: Send to LINE Notify (if you have token)
		// await sendToLineNotify(chatbotMessage)

		// Optional: Send to Slack (if you have webhook URL)
		// await sendToSlack(chatbotMessage)

		return NextResponse.json({
			success: true,
			message: 'ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับเร็วๆ นี้'
		})

	} catch (err: any) {
		console.error('❌ Contact form error:', err.message || err)
		return NextResponse.json({
			error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
		}, { status: 500 })
	}
}

function formatChatbotMessage(data: {
	name: string
	email: string
	phone: string
	company: string
	subject: string
	message: string
}): string {
	const subjectLabels: { [key: string]: string } = {
		'product': 'สอบถามข้อมูลผลิตภัณฑ์',
		'support': 'ขอความช่วยเหลือทางเทคนิค',
		'quotation': 'ขอใบเสนอราคา',
		'partnership': 'สนใจความร่วมมือทางธุรกิจ',
		'other': 'อื่นๆ'
	}

	return `
🔔 มีข้อความติดต่อใหม่!

📝 หัวข้อ: ${subjectLabels[data.subject] || data.subject}

👤 ชื่อ: ${data.name}
${data.company ? `🏢 บริษัท: ${data.company}` : ''}
📧 อีเมล: ${data.email}
📞 เบอร์โทร: ${data.phone}

💬 ข้อความ:
${data.message}

⏰ เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
	`.trim()
}

// Optional: Function to send to LINE Notify
async function sendToLineNotify(message: string) {
	const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN

	if (!LINE_NOTIFY_TOKEN) {
		console.warn('⚠️ LINE_NOTIFY_TOKEN not configured')
		return
	}

	try {
		const response = await fetch('https://notify-api.line.me/api/notify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`
			},
			body: new URLSearchParams({
				message: message
			})
		})

		if (!response.ok) {
			throw new Error(`LINE Notify failed: ${response.statusText}`)
		}

		console.log('✅ Sent to LINE Notify successfully')
	} catch (error) {
		console.error('❌ Failed to send LINE Notify:', error)
	}
}

// Optional: Function to send to Slack
async function sendToSlack(message: string) {
	const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

	if (!SLACK_WEBHOOK_URL) {
		console.warn('⚠️ SLACK_WEBHOOK_URL not configured')
		return
	}

	try {
		const response = await fetch(SLACK_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: message
			})
		})

		if (!response.ok) {
			throw new Error(`Slack webhook failed: ${response.statusText}`)
		}

		console.log('✅ Sent to Slack successfully')
	} catch (error) {
		console.error('❌ Failed to send to Slack:', error)
	}
}
