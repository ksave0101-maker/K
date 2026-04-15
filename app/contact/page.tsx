"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		company: '',
		subject: '',
		message: ''
	})
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Language state
	const [language, setLanguage] = useState<'en' | 'th' | 'ko' | 'zh' | 'vi'>('en')

	// Chatbot state
	const [chatOpen, setChatOpen] = useState(false)
	const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'bot'}>>([])
	const [chatInput, setChatInput] = useState('')
	const [chatLoading, setChatLoading] = useState(false)
	const [mounted, setMounted] = useState(false)

	// Translation data
	const translations = {
		en: {
			title: 'Contact Us',
			subtitle: 'Get in Touch',
			description: 'Have questions about our energy-saving solutions? Fill out the form below and our team will get back to you within 24 hours.',
			name: 'Full Name',
			namePlaceholder: 'John Doe',
			email: 'Email Address',
			emailPlaceholder: 'john@example.com',
			phone: 'Phone Number',
			phonePlaceholder: '+66 2 0808916',
			company: 'Company Name (Optional)',
			companyPlaceholder: 'Your Company',
			subject: 'Subject',
			subjectProduct: 'Product Inquiry',
			subjectSupport: 'Technical Support',
			subjectQuotation: 'Request Quotation',
			subjectPartnership: 'Business Partnership',
			subjectOther: 'Other',
			selectSubject: 'Select a subject',
			message: 'Your Message',
			messagePlaceholder: 'Tell us about your energy-saving needs...',
			submit: 'Send Message',
			sending: 'Sending...',
			successTitle: 'Message Sent Successfully!',
			successMessage: 'Thank you for contacting us. Our team will respond within 24 hours.',
			otherWays: 'Other Ways to Reach Us',
			phoneLabel: 'Phone',
			emailLabel: 'Email',
			lineLabel: 'LINE Official',
			hoursLabel: 'Business Hours',
			hoursValue: 'Mon-Fri 9:00-18:00',
			chatButton: 'Chat with us',
			chatTitle: 'K Energy Save',
			chatOnline: 'Online',
			chatPlaceholder: 'Type your message...',
			chatInitial: 'Hello! How can I help you today?',
			privacyPolicy: 'Privacy Policy',
			adminLogin: 'Admin Login'
		},
		th: {
			title: 'ติดต่อเรา',
			subtitle: 'ติดต่อสอบถาม',
			description: 'มีคำถามเกี่ยวกับโซลูชั่นประหยัดพลังงานของเราหรือไม่? กรอกแบบฟอร์มด้านล่างและทีมงานของเราจะติดต่อกลับภายใน 24 ชั่วโมง',
			name: 'ชื่อ-นามสกุล',
			namePlaceholder: 'สมชาย ใจดี',
			email: 'อีเมล',
			emailPlaceholder: 'somchai@example.com',
			phone: 'เบอร์โทรศัพท์',
			phonePlaceholder: '08X-XXX-XXXX',
			company: 'ชื่อบริษัท (ไม่บังคับ)',
			companyPlaceholder: 'บริษัทของคุณ',
			subject: 'หัวข้อ',
			subjectProduct: 'สอบถามข้อมูลผลิตภัณฑ์',
			subjectSupport: 'ขอความช่วยเหลือทางเทคนิค',
			subjectQuotation: 'ขอใบเสนอราคา',
			subjectPartnership: 'สนใจความร่วมมือทางธุรกิจ',
			subjectOther: 'อื่นๆ',
			selectSubject: 'เลือกหัวข้อ',
			message: 'ข้อความของคุณ',
			messagePlaceholder: 'บอกเราเกี่ยวกับความต้องการประหยัดพลังงานของคุณ...',
			submit: 'ส่งข้อความ',
			sending: 'กำลังส่ง...',
			successTitle: 'ส่งข้อความสำเร็จ!',
			successMessage: 'ขอบคุณที่ติดต่อเรา ทีมงานจะตอบกลับภายใน 24 ชั่วโมง',
			otherWays: 'ช่องทางการติดต่ออื่นๆ',
			phoneLabel: 'โทรศัพท์',
			emailLabel: 'อีเมล',
			lineLabel: 'ไลน์ทางการ',
			hoursLabel: 'เวลาทำการ',
			hoursValue: 'จันทร์-ศุกร์ 9:00-18:00',
			chatButton: 'แชทกับเรา',
			chatTitle: 'บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด',
			chatOnline: 'ออนไลน์',
			chatPlaceholder: 'พิมพ์ข้อความของคุณ...',
			chatInitial: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?',
			privacyPolicy: 'นโยบายความเป็นส่วนตัว',
			adminLogin: 'เข้าสู่ระบบผู้ดูแล'
		},
		ko: {
			title: '문의하기',
			subtitle: '연락처',
			description: '에너지 절약 솔루션에 대해 궁금한 점이 있으신가요? 아래 양식을 작성해 주시면 24시간 이내에 답변 드리겠습니다.',
			name: '성함',
			namePlaceholder: '홍길동',
			email: '이메일 주소',
			emailPlaceholder: 'hong@example.com',
			phone: '전화번호',
			phonePlaceholder: '010-XXXX-XXXX',
			company: '회사명 (선택사항)',
			companyPlaceholder: '귀하의 회사',
			subject: '제목',
			subjectProduct: '제품 문의',
			subjectSupport: '기술 지원',
			subjectQuotation: '견적 요청',
			subjectPartnership: '비즈니스 파트너십',
			subjectOther: '기타',
			selectSubject: '주제를 선택하세요',
			message: '메시지',
			messagePlaceholder: '에너지 절약 요구사항에 대해 알려주세요...',
			submit: '메시지 보내기',
			sending: '전송 중...',
			successTitle: '메시지가 성공적으로 전송되었습니다!',
			successMessage: '문의해 주셔서 감사합니다. 24시간 이내에 답변 드리겠습니다.',
			otherWays: '기타 연락 방법',
			phoneLabel: '전화',
			emailLabel: '이메일',
			lineLabel: 'LINE 공식',
			hoursLabel: '영업 시간',
			hoursValue: '월-금 9:00-18:00',
			chatButton: '채팅하기',
			chatTitle: 'K 에너지 세이브',
			chatOnline: '온라인',
			chatPlaceholder: '메시지를 입력하세요...',
			chatInitial: '안녕하세요! 무엇을 도와드릴까요?',
			privacyPolicy: '개인정보 처리방침',
			adminLogin: '관리자 로그인'
		},
		zh: {
			title: '联系我们',
			subtitle: '取得联系',
			description: '对我们的节能解决方案有疑问吗？请填写下面的表格，我们的团队将在24小时内回复您。',
			name: '全名',
			namePlaceholder: '张三',
			email: '电子邮件地址',
			emailPlaceholder: 'zhang@example.com',
			phone: '电话号码',
			phonePlaceholder: '+86 XXX-XXXX-XXXX',
			company: '公司名称（可选）',
			companyPlaceholder: '您的公司',
			subject: '主题',
			subjectProduct: '产品咨询',
			subjectSupport: '技术支持',
			subjectQuotation: '索取报价',
			subjectPartnership: '商业合作',
			subjectOther: '其他',
			selectSubject: '请选择主题',
			message: '您的留言',
			messagePlaceholder: '告诉我们您的节能需求...',
			submit: '发送消息',
			sending: '发送中...',
			successTitle: '消息发送成功！',
			successMessage: '感谢您联系我们。我们的团队将在24小时内回复。',
			otherWays: '其他联系方式',
			phoneLabel: '电话',
			emailLabel: '电子邮件',
			lineLabel: 'LINE 官方',
			hoursLabel: '营业时间',
			hoursValue: '周一至周五 9:00-18:00',
			chatButton: '与我们聊天',
			chatTitle: 'K 能源节省',
			chatOnline: '在线',
			chatPlaceholder: '输入您的消息...',
			chatInitial: '您好！有什么可以帮您的吗？',
			privacyPolicy: '隐私政策',
			adminLogin: '管理员登录'
		}
		,
		vi: {
			title: 'Liên hệ chúng tôi',
			subtitle: 'Liên hệ',
			description: 'Có thắc mắc về giải pháp tiết kiệm năng lượng? Vui lòng điền biểu mẫu bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ.',
			name: 'Họ và tên',
			namePlaceholder: 'Nguyễn Văn A',
			email: 'Email',
			emailPlaceholder: 'nguyen@example.com',
			phone: 'Số điện thoại',
			phonePlaceholder: '+84 123 456 789',
			company: 'Tên công ty (Tùy chọn)',
			companyPlaceholder: 'Công ty của bạn',
			subject: 'Chủ đề',
			subjectProduct: 'Hỏi về sản phẩm',
			subjectSupport: 'Hỗ trợ kỹ thuật',
			subjectQuotation: 'Yêu cầu báo giá',
			subjectPartnership: 'Hợp tác kinh doanh',
			subjectOther: 'Khác',
			selectSubject: 'Chọn chủ đề',
			message: 'Tin nhắn của bạn',
			messagePlaceholder: 'Cho chúng tôi biết nhu cầu tiết kiệm năng lượng...',
			submit: 'Gửi tin nhắn',
			sending: 'Đang gửi...',
			successTitle: 'Gửi tin thành công!',
			successMessage: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
			otherWays: 'Các cách liên hệ khác',
			phoneLabel: 'Điện thoại',
			emailLabel: 'Email',
			lineLabel: 'LINE Official',
			hoursLabel: 'Giờ làm việc',
			hoursValue: 'Thứ Hai - Thứ Sáu 9:00-18:00',
			chatButton: 'Trò chuyện với chúng tôi',
			chatTitle: 'K Energy Save',
			chatOnline: 'Trực tuyến',
			chatPlaceholder: 'Nhập tin nhắn của bạn...',
			chatInitial: 'Xin chào! Tôi có thể giúp gì cho bạn?',
			privacyPolicy: 'Chính sách bảo mật',
			adminLogin: 'Đăng nhập quản trị'
		}
	}

	const t = translations[language]

	// Initialize chat message on mount
	React.useEffect(() => {
		setMounted(true)
		setChatMessages([{ text: translations[language].chatInitial, sender: 'bot' }])
	}, [])

	// Update chat initial message when language changes
	const handleLanguageChange = (lang: 'en' | 'th' | 'ko' | 'zh' | 'vi') => {
		setLanguage(lang)
		setChatMessages([{ text: translations[lang].chatInitial, sender: 'bot' }])
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || 'Failed to send message')
			}

			setSuccess(true)
			setFormData({
				name: '',
				email: '',
				phone: '',
				company: '',
				subject: '',
				message: ''
			})

			setTimeout(() => {
				setSuccess(false)
			}, 5000)
		} catch (err: any) {
			setError(err?.message || 'Failed to send message')
		} finally {
			setLoading(false)
		}
	}

	async function handleChatSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!chatInput.trim()) return

		const userMessage = chatInput.trim()
		setChatMessages(prev => [...prev, { text: userMessage, sender: 'user' }])
		setChatInput('')
		setChatLoading(true)

		// Simulate bot response (replace with actual API call)
		setTimeout(() => {
			const botResponse = getBotResponse(userMessage)
			setChatMessages(prev => [...prev, { text: botResponse, sender: 'bot' }])
			setChatLoading(false)
		}, 1000)
	}

	function getBotResponse(message: string): string {
		const lowerMsg = message.toLowerCase()

		// Detect language from message
		const isThai = /[\u0E00-\u0E7F]/.test(message)
		const isKorean = /[\uAC00-\uD7AF]/.test(message)
		const isChinese = /[\u4E00-\u9FFF]/.test(message)
		const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(message)

		// Thai responses
		if (isThai) {
			if (lowerMsg.includes('สวัสดี') || lowerMsg.includes('หวัดดี') || lowerMsg.includes('ดีครับ') || lowerMsg.includes('ดีค่ะ')) {
				return 'สวัสดีครับ! ยินดีต้อนรับสู่ K Energy Save 👋\n\nเราเชี่ยวชาญด้านโซลูชันประหยัดพลังงานที่ได้รับความไว้วางใจใน 40+ ประเทศ\n\nมีอะไรให้ช่วยไหมครับ?\n\n• ข้อมูลผลิตภัณฑ์\n• ราคาและใบเสนอราคา\n• บริการติดตั้ง\n• ฝ่ายสนับสนุนด้านเทคนิค'
			}
			if (lowerMsg.includes('ผลิตภัณฑ์') || lowerMsg.includes('สินค้า') || lowerMsg.includes('รุ่น')) {
				return '⚡ ผลิตภัณฑ์ K-SAVER:\n\n✓ K-SAVER 10 - สำหรับสถานที่ขนาดเล็ก (10-50 kW)\n✓ K-SAVER 30 - สำหรับสถานที่ขนาดกลาง (50-150 kW)\n✓ K-SAVER Max - สำหรับโรงงานอุตสาหกรรมขนาดใหญ่ (150+ kW)\n\n🌟 ประโยชน์หลัก:\n• รับประกันประหยัดไฟ 7-15%\n• เทคโนโลยีจดสิทธิบัตร\n• คืนทุนภายใน 12-24 เดือน\n• ไม่ต้องบำรุงรักษา\n\nสนใจรุ่นไหนครับ?'
			}
			if (lowerMsg.includes('ราคา') || lowerMsg.includes('เท่าไหร่') || lowerMsg.includes('ค่าใช้จ่าย') || lowerMsg.includes('ใบเสนอราคา')) {
				return '💰 ข้อมูลราคา:\n\nราคาขึ้นอยู่กับ:\n• ขนาดและการใช้ไฟของสถานที่\n• ความซับซ้อนในการติดตั้ง\n• รุ่นที่เลือก\n\n📋 ขอใบเสนอราคาฟรี:\n📞 โทร: +66 2 0808916\n📧 อีเมล: info@kenergy-save.com\n💬 LINE: @534znjie\n\nเรามีแผนผ่อนชำระและวิเคราะห์ ROI ให้ครับ!'
			}
			if (lowerMsg.includes('ติดตั้ง') || lowerMsg.includes('ใช้เวลา')) {
				return '🔧 ขั้นตอนการติดตั้ง:\n\n1️⃣ สำรวจหน้างานและประเมิน (ฟรี)\n2️⃣ ออกแบบโซลูชันเฉพาะ\n3️⃣ ติดตั้งโดยผู้เชี่ยวชาญ (2-6 ชั่วโมง)\n4️⃣ ทดสอบและตรวจรับ\n5️⃣ อบรมและจัดทำเอกสาร\n6️⃣ บริการหลังการขาย\n\n✓ ช่างที่ได้รับการรับรอง\n✓ ไม่กระทบการทำงาน\n✓ สนับสนุนด้านเทคนิค 24/7\n\nพร้อมนัดติดตั้งไหมครับ?'
			}
			if (lowerMsg.includes('ประหยัด') || lowerMsg.includes('ลด') || lowerMsg.includes('คืนทุน')) {
				return '💡 การประหยัดพลังงาน:\n\n📊 ประหยัดเฉลี่ย: 7-15%\n💵 คืนทุน: 12-24 เดือน\n📈 อายุการใช้งาน: 10+ ปี\n\n💰 ตัวอย่าง:\nค่าไฟรายเดือน: ฿100,000\nประหยัด (10%): ฿10,000/เดือน\nประหยัดต่อปี: ฿120,000\nระยะคืนทุน: 18 เดือน\n\nต้องการวิเคราะห์การประหยัดเฉพาะหน่วยงานไหมครับ?'
			}
			if (lowerMsg.includes('รับประกัน') || lowerMsg.includes('การันตี') || lowerMsg.includes('ใบรับรอง')) {
				return '🏆 การรับประกัน:\n\n✓ K-SAVER 10: 3 ปี\n✓ K-SAVER 30: 5 ปี\n✓ K-SAVER Max: 7 ปี\n\n✓ ใบรับรอง: ISO 9001:2015, CE & RoHS, UL Listed\n✓ การันตีประหยัดพลังงาน 7-15%\n✓ บำรุงรักษาฟรี (ช่วงประกัน)\n✓ สนับสนุนด้านเทคนิค 24/7\n\nได้รับความไว้วางใจจาก 1,000+ องค์กรทั่วโลก!'
			}
			if (lowerMsg.includes('ติดต่อ') || lowerMsg.includes('โทร') || lowerMsg.includes('ที่อยู่') || lowerMsg.includes('ไลน์')) {
				return '📞 ติดต่อ K Energy Save:\n\n📱 โทร: +66 2 0808916\n📧 อีเมล: info@kenergy-save.com\n💬 LINE: @534znjie\n\n🏢 เวลาทำการ:\nจันทร์ - ศุกร์: 9:00 - 18:00 น.\n\nหรือกรอกแบบฟอร์มติดต่อ เราจะตอบกลับภายใน 24 ชั่วโมง!'
			}
			if (lowerMsg.includes('ทำงาน') || lowerMsg.includes('หลักการ') || lowerMsg.includes('เทคโนโลยี') || lowerMsg.includes('ยังไง') || lowerMsg.includes('อย่างไร')) {
				return '🔬 หลักการทำงานของ K-SAVER:\n\n⚡ การเพิ่มประสิทธิภาพพลังงาน:\n• ลดการใช้ Reactive Power\n• ปรับสมดุลโหลดไฟฟ้า\n• กรอง Harmonics\n• ปรับ Power Factor เป็น 0.95+\n\n🌟 ผลลัพธ์:\n✓ ค่าไฟลดลง\n✓ อุปกรณ์อายุยืนขึ้น\n✓ คุณภาพไฟฟ้าดีขึ้น'
			}
			if (lowerMsg.includes('ช่วย') || lowerMsg.includes('ปัญหา') || lowerMsg.includes('บริการ') || lowerMsg.includes('ซ่อม')) {
				return '🛠️ ฝ่ายบริการลูกค้า:\n\n📞 สายด่วน 24/7: +66 2 0808916\n💬 LINE: @534znjie\n📧 อีเมล: info@kenergy-save.com\n\n✓ วินิจฉัยปัญหาระยะไกล\n✓ บำรุงรักษาที่หน้างาน\n✓ ตอบสนองฉุกเฉิน\n✓ อะไหล่พร้อมส่ง\n\nเราพร้อมช่วยเหลือครับ!'
			}
			// Default Thai
			return '😊 ขอบคุณสำหรับคำถามครับ!\n\nผมช่วยเรื่องเหล่านี้ได้:\n• ข้อมูลผลิตภัณฑ์ (K-SAVER)\n• ราคาและใบเสนอราคา\n• บริการติดตั้ง\n• สนับสนุนด้านเทคนิค\n• คำนวณการประหยัด\n• การรับประกัน\n\nหรือติดต่อทีมงานโดยตรง:\n📞 +66 2 0808916\n📧 info@kenergy-save.com\n💬 LINE: @534znjie\n\nต้องการทราบเรื่องอะไรเพิ่มเติมครับ?'
		}

		// Korean responses
		if (isKorean) {
			if (lowerMsg.includes('안녕') || lowerMsg.includes('반갑')) {
				return '안녕하세요! K Energy Save에 오신 것을 환영합니다 👋\n\n40개국 이상에서 신뢰받는 에너지 절약 솔루션 전문 기업입니다.\n\n무엇을 도와드릴까요?\n\n• 제품 정보\n• 가격 및 견적\n• 설치 서비스\n• 기술 지원'
			}
			return '😊 문의해 주셔서 감사합니다!\n\n다음 사항에 대해 도움드릴 수 있습니다:\n• 제품 정보 (K-SAVER)\n• 가격 및 견적\n• 설치 서비스\n• 기술 지원\n\n직접 연락:\n📞 +82 31-427-1380\n📧 info@kenergy-save.com\n\n더 알고 싶은 것이 있으신가요?'
		}

		// Chinese responses
		if (isChinese) {
			if (lowerMsg.includes('你好') || lowerMsg.includes('您好')) {
				return '您好！欢迎来到 K Energy Save 👋\n\n我们是专业的节能解决方案提供商，业务遍及40多个国家。\n\n有什么可以帮您的？\n\n• 产品信息\n• 价格与报价\n• 安装服务\n• 技术支持'
			}
			return '😊 感谢您的咨询！\n\n我可以帮助您了解：\n• 产品信息 (K-SAVER)\n• 价格与报价\n• 安装服务\n• 技术支持\n\n直接联系我们：\n📞 +82 31-427-1380\n📧 info@kenergy-save.com\n\n还有什么想了解的吗？'
		}

		// Vietnamese responses
		if (isVietnamese) {
			if (lowerMsg.includes('xin chào') || lowerMsg.includes('chào') || lowerMsg.includes('hello')) {
				return 'Xin chào! Chào mừng bạn đến với K Energy Save 👋\n\nChúng tôi chuyên về giải pháp tiết kiệm năng lượng được tin dùng tại hơn 40 quốc gia.\n\nTôi có thể giúp gì cho bạn?\n\n• Thông tin sản phẩm\n• Giá cả & Báo giá\n• Dịch vụ lắp đặt\n• Hỗ trợ kỹ thuật'
			}
			if (lowerMsg.includes('sản phẩm') || lowerMsg.includes('k-saver')) {
				return '⚡ Dòng sản phẩm K-SAVER:\n\n✓ K-SAVER 10 - Cho cơ sở nhỏ (10-50 kW)\n✓ K-SAVER 30 - Cho cơ sở vừa (50-150 kW)\n✓ K-SAVER Max - Cho nhà máy công nghiệp lớn (150+ kW)\n\n🌟 Lợi ích chính:\n• Tiết kiệm điện 7-15% được đảm bảo\n• Công nghệ được cấp bằng sáng chế\n• ROI trong vòng 12-24 tháng\n• Không cần bảo trì\n\nBạn muốn biết thêm về mô hình nào?'
			}
			if (lowerMsg.includes('giá') || lowerMsg.includes('báo giá') || lowerMsg.includes('chi phí')) {
				return '💰 Thông tin giá:\n\nGiá của chúng tôi phụ thuộc vào:\n• Quy mô và mức tiêu thụ của cơ sở\n• Độ phức tạp khi lắp đặt\n• Lựa chọn mô hình sản phẩm\n• Giảm giá theo số lượng\n\n📋 Nhận báo giá MIỄN PHÍ:\n📞 Gọi: +82 31-427-1380\n📧 Email: info@kenergy-save.com / info@zera-energy.com\n💬 LINE: @534znjie\n\nChúng tôi cung cấp kế hoạch thanh toán linh hoạt và phân tích ROI!'
			}
			if (lowerMsg.includes('lắp đặt') || lowerMsg.includes('cài đặt')) {
				return '🔧 Quy trình lắp đặt:\n\n1️⃣ Khảo sát & Đánh giá hiện trường (MIỄN PHÍ)\n2️⃣ Thiết kế giải pháp tùy chỉnh\n3️⃣ Lắp đặt chuyên nghiệp (2-6 giờ)\n4️⃣ Kiểm tra & Vận hành thử\n5️⃣ Đào tạo & Tài liệu\n6️⃣ Hỗ trợ sau bán hàng\n\n✓ Kỹ thuật viên được chứng nhận\n✓ Thời gian ngừng hoạt động tối thiểu\n✓ Bảo hiểm toàn diện\n✓ Hỗ trợ kỹ thuật 24/7\n\nBạn đã sẵn sàng để lên lịch lắp đặt chưa?'
			}
			if (lowerMsg.includes('tiết kiệm') || lowerMsg.includes('giảm') || lowerMsg.includes('roi')) {
				return '💡 Máy tính tiết kiệm năng lượng:\n\n📊 Tiết kiệm trung bình: 7-15%\n💵 ROI điển hình: 12-24 tháng\n📈 Giá trị trọn đời: 10+ năm\n\n💰 Ví dụ tính toán:\nHóa đơn hàng tháng: ฿100,000\nTiết kiệm (10%): ฿10,000/tháng\nTiết kiệm hàng năm: ฿120,000\nThời gian hoàn vốn: 18 tháng\n\n✨ Lợi ích:\n• Giảm chi phí ngay lập tức\n• Cải thiện chất lượng điện\n• Kéo dài tuổi thọ thiết bị\n• Giảm lượng khí thải carbon\n\nBạn muốn phân tích tiết kiệm tùy chỉnh?'
			}
			if (lowerMsg.includes('bảo hành') || lowerMsg.includes('đảm bảo') || lowerMsg.includes('chứng nhận')) {
				return '🏆 Bảo hành & Chứng nhận:\n\n✓ Bảo hành sản phẩm:\n  • K-SAVER 10: 3 năm\n  • K-SAVER 30: 5 năm\n  • K-SAVER Max: 7 năm\n\n✓ Chứng nhận:\n  • ISO 9001:2015\n  • Công nghệ được cấp bằng sáng chế\n  • CE & RoHS\n  • UL Listed\n\n✓ Đảm bảo:\n  • Tiết kiệm năng lượng 7-15%\n  • Bảo trì miễn phí (thời gian bảo hành)\n  • Hỗ trợ kỹ thuật 24/7\n  • Thay thế linh kiện\n\nĐược tin dùng bởi hơn 1,000+ doanh nghiệp trên toàn thế giới!'
			}
			if (lowerMsg.includes('liên hệ') || lowerMsg.includes('gọi') || lowerMsg.includes('email')) {
				return '📞 Liên hệ K Energy Save:\n\n📱 Điện thoại: +82 31-427-1380\n📧 Email: info@kenergy-save.com / info@zera-energy.com\n💬 LINE: @534znjie\n\n🏢 Giờ làm việc:\nThứ Hai - Thứ Sáu\n9:00 - 18:00 (Giờ Bangkok)\n\n📍 Hoặc điền vào biểu mẫu liên hệ và chúng tôi sẽ phản hồi trong vòng 24 giờ!\n\nTôi có thể giúp gì cho bạn hôm nay?'
			}
			if (lowerMsg.includes('hoạt động') || lowerMsg.includes('công nghệ') || lowerMsg.includes('như thế nào')) {
				return '🔬 Cách thức hoạt động của K-SAVER:\n\n⚡ Tối ưu hóa điện năng tiên tiến:\n• Giảm tiêu thụ công suất phản kháng\n• Cân bằng tải điện\n• Lọc sóng hài & đột biến điện áp\n• Tối ưu hóa hệ số công suất lên 0.95+\n\n🎯 Tính năng thông minh:\n• Giám sát theo thời gian thực\n• Điều chỉnh điện áp tự động\n• Bảo vệ chống sét\n• Bảng điều khiển phân tích năng lượng\n\n🌟 Kết quả:\n✓ Hóa đơn tiền điện thấp hơn\n✓ Tuổi thọ thiết bị kéo dài\n✓ Chi phí bảo trì giảm\n✓ Chất lượng điện được cải thiện\n\nCông nghệ được cấp bằng sáng chế, kết quả đã được chứng minh!'
			}
			if (lowerMsg.includes('hỗ trợ') || lowerMsg.includes('dịch vụ') || lowerMsg.includes('giúp đỡ') || lowerMsg.includes('vấn đề')) {
				return '🛠️ Hỗ trợ khách hàng:\n\n📞 Hotline 24/7:\n  +82 31-427-1380\n\n💬 Hỗ trợ tức thì:\n  LINE: @534znjie\n\n📧 Hỗ trợ qua Email:\n  info@kenergy-save.com / info@zera-energy.com\n\n🏢 Giờ làm việc:\n  Thứ Hai - Thứ Sáu: 9:00-18:00\n\n✓ Chẩn đoán từ xa\n✓ Bảo trì tại chỗ\n✓ Phản hồi khẩn cấp\n✓ Linh kiện luôn sẵn có\n\nChúng tôi luôn sẵn sàng hỗ trợ bạn!'
			}
			// Default Vietnamese
			return '😊 Cảm ơn câu hỏi của bạn!\n\nTôi có thể giúp bạn với:\n• Thông tin sản phẩm (Các mô hình K-SAVER)\n• Giá cả & Báo giá\n• Dịch vụ lắp đặt\n• Hỗ trợ kỹ thuật\n• Máy tính tiết kiệm\n• Bảo hành & Chứng nhận\n\nHoặc liên hệ trực tiếp:\n📞 +82 31-427-1380\n📧 info@kenergy-save.com / info@zera-energy.com\n💬 LINE: @534znjie\n\nBạn muốn biết thêm về điều gì?'
		}

		// English responses (default)
		// Greetings
		if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
			return 'Hello! Welcome to K Energy Save 👋\n\nWe specialize in energy-saving solutions trusted in 40+ countries. How can I help you today?\n\n• Product Information\n• Pricing & Quotation\n• Installation Service\n• Technical Support'
		}

		// Products - General
		if (lowerMsg.includes('product') || lowerMsg.includes('k-saver')) {
			return '⚡ Our K-SAVER Product Line:\n\n✓ K-SAVER 10 - For small facilities (10-50 kW)\n✓ K-SAVER 30 - For medium facilities (50-150 kW)\n✓ K-SAVER Max - For large industrial facilities (150+ kW)\n\n🌟 Key Benefits:\n• 7-15% electricity savings guaranteed\n• Patented & certified technology\n• ROI within 12-24 months\n• Maintenance-free operation\n\nWhich model would you like to know more about?'
		}

		// K-SAVER 10
		if (lowerMsg.includes('k-saver 10') || lowerMsg.includes('ksaver 10') || lowerMsg.includes('small')) {
			return '⚡ K-SAVER 10 Specifications:\n\n📊 Capacity: 10-50 kW\n💡 Ideal for: Small offices, retail stores, restaurants\n💰 Savings: 7-12% on electricity bills\n🔧 Installation: 2-3 hours\n⭐ Warranty: 3 years\n\nPerfect for businesses looking to reduce operational costs!\n\nWould you like a quotation?'
		}

		// K-SAVER 30
		if (lowerMsg.includes('k-saver 30') || lowerMsg.includes('ksaver 30') || lowerMsg.includes('medium')) {
			return '⚡ K-SAVER 30 Specifications:\n\n📊 Capacity: 50-150 kW\n💡 Ideal for: Shopping malls, hotels, medium factories\n💰 Savings: 10-15% on electricity bills\n🔧 Installation: 3-4 hours\n⭐ Warranty: 5 years\n\nOur most popular model for commercial buildings!\n\nWould you like to speak with our sales team?'
		}

		// K-SAVER Max
		if (lowerMsg.includes('k-saver max') || lowerMsg.includes('ksaver max') || lowerMsg.includes('large') || lowerMsg.includes('industrial')) {
			return '⚡ K-SAVER Max Specifications:\n\n📊 Capacity: 150+ kW\n💡 Ideal for: Large factories, industrial plants, hospitals\n💰 Savings: 12-15% on electricity bills\n🔧 Installation: 4-6 hours (custom setup)\n⭐ Warranty: 7 years + extended support\n\nEnterprise-grade solution with maximum efficiency!\n\nLet\'s schedule a site survey for accurate assessment.'
		}

		// Pricing & Quotation
		if (lowerMsg.includes('price') || lowerMsg.includes('quote') || lowerMsg.includes('cost') || lowerMsg.includes('ราคา')) {
			return '💰 Pricing Information:\n\nOur pricing depends on:\n• Facility size and consumption\n• Installation complexity\n• Product model selection\n• Volume discounts available\n\n📋 Get a FREE Quote:\n1. Fill out the contact form\n2. Call: +82 31-427-1380\n3. Email: info@kenergy-save.com / info@zera-energy.com\n4. LINE: @534znjie\n\nWe offer flexible payment plans and ROI analysis!'
		}

		// Installation
		if (lowerMsg.includes('install') || lowerMsg.includes('setup') || lowerMsg.includes('ติดตั้ง')) {
			return '🔧 Installation Process:\n\n1️⃣ Site Survey & Assessment (FREE)\n2️⃣ Custom Solution Design\n3️⃣ Professional Installation (2-6 hours)\n4️⃣ Testing & Commissioning\n5️⃣ Training & Documentation\n6️⃣ After-sales Support\n\n✓ Certified technicians\n✓ Minimal downtime\n✓ Full insurance coverage\n✓ 24/7 technical support\n\nReady to schedule your installation?'
		}

		// Savings & ROI
		if (lowerMsg.includes('save') || lowerMsg.includes('savings') || lowerMsg.includes('roi') || lowerMsg.includes('return') || lowerMsg.includes('ประหยัด')) {
			return '💡 Energy Savings Calculator:\n\n📊 Average Savings: 7-15%\n💵 Typical ROI: 12-24 months\n📈 Lifetime Value: 10+ years\n\n💰 Example Calculation:\nMonthly Bill: ฿100,000\nSavings (10%): ฿10,000/month\nAnnual Savings: ฿120,000\nPayback Period: 18 months\n\n✨ Benefits:\n• Immediate cost reduction\n• Improved power quality\n• Extended equipment life\n• Lower carbon footprint\n\nWant a customized savings analysis?'
		}

		// Warranty & Certification
		if (lowerMsg.includes('warranty') || lowerMsg.includes('guarantee') || lowerMsg.includes('certif') || lowerMsg.includes('รับประกัน')) {
			return '🏆 Warranty & Certification:\n\n✓ Product Warranty:\n  • K-SAVER 10: 3 years\n  • K-SAVER 30: 5 years\n  • K-SAVER Max: 7 years\n\n✓ Certifications:\n  • ISO 9001:2015 Certified\n  • Patented Technology\n  • CE & RoHS Compliant\n  • UL Listed\n\n✓ Guarantees:\n  • 7-15% energy savings\n  • Free maintenance (warranty period)\n  • 24/7 technical support\n  • Parts replacement coverage\n\nTrusted by 1,000+ businesses worldwide!'
		}

		// Technology & How it works
		if (lowerMsg.includes('how') || lowerMsg.includes('work') || lowerMsg.includes('technology') || lowerMsg.includes('tech')) {
			return '🔬 How K-SAVER Technology Works:\n\n⚡ Advanced Power Optimization:\n• Reduces reactive power consumption\n• Balances electrical loads\n• Filters harmonics & voltage spikes\n• Optimizes power factor to 0.95+\n\n🎯 Smart Features:\n• Real-time monitoring\n• Automatic voltage regulation\n• Surge protection\n• Energy analytics dashboard\n\n🌟 Result:\n✓ Lower electricity bills\n✓ Extended equipment lifespan\n✓ Reduced maintenance costs\n✓ Improved power quality\n\nPatented technology, proven results!'
		}

		// Support & Service
		if (lowerMsg.includes('support') || lowerMsg.includes('service') || lowerMsg.includes('help') || lowerMsg.includes('problem')) {
			return '🛠️ Customer Support:\n\n📞 24/7 Technical Hotline:\n  +82 31-427-1380\n\n💬 Instant Support:\n  LINE: @534znjie\n\n📧 Email Support:\n  info@kenergy-save.com / info@zera-energy.com\n\n🏢 Business Hours:\n  Mon-Fri: 9:00-18:00\n\n✓ Remote diagnostics\n✓ On-site maintenance\n✓ Emergency response\n✓ Spare parts availability\n\nWe\'re here to help you succeed!'
		}

		// Contact Information
		if (lowerMsg.includes('contact') || lowerMsg.includes('reach') || lowerMsg.includes('call') || lowerMsg.includes('email') || lowerMsg.includes('ติดต่อ')) {
			return '📞 Contact K Energy Save:\n\n📱 Phone: +82 31-427-1380\n📧 Email: info@kenergy-save.com / info@zera-energy.com\n💬 LINE: @534znjie\n\n🏢 Office Hours:\nMonday - Friday\n9:00 AM - 6:00 PM (Bangkok Time)\n\n📍 Or fill out our contact form and we\'ll respond within 24 hours!\n\nHow can we assist you today?'
		}

		// Countries & International
		if (lowerMsg.includes('country') || lowerMsg.includes('countries') || lowerMsg.includes('international') || lowerMsg.includes('global')) {
			return '🌍 Global Presence:\n\nK Energy Save is trusted in 40+ countries across:\n\n🌏 Asia-Pacific:\nThailand, Korea, Japan, Singapore, Malaysia, Indonesia, Vietnam, Philippines\n\n🌍 Middle East:\nUAE, Saudi Arabia, Qatar, Kuwait\n\n🌎 Americas:\nUSA, Canada, Mexico\n\n🌍 Europe:\nGermany, UK, France, Spain\n\n✓ International certifications\n✓ Multi-language support\n✓ Local partnerships\n✓ Global warranty coverage\n\nExpanding to more countries soon!'
		}

		// Case Studies & References
		if (lowerMsg.includes('case') || lowerMsg.includes('example') || lowerMsg.includes('reference') || lowerMsg.includes('customer')) {
			return '📊 Success Stories:\n\n🏭 Manufacturing Plant (Thailand):\n• Installed: K-SAVER Max\n• Savings: 14.5% monthly\n• ROI: 16 months\n• Annual Benefit: ฿2.4M\n\n🏨 Hotel Chain (Bangkok):\n• Installed: K-SAVER 30\n• Savings: 11.8% monthly\n• ROI: 20 months\n• Improved guest comfort\n\n🏬 Shopping Mall (Phuket):\n• Installed: K-SAVER Max\n• Savings: 13.2% monthly\n• ROI: 18 months\n• Reduced carbon footprint\n\nJoin 1,000+ satisfied customers!\n\nWant to schedule a site visit?'
		}

		// Default response
		return '😊 Thank you for your question!\n\nI can help you with:\n• Product Information (K-SAVER models)\n• Pricing & Quotations\n• Installation Services\n• Technical Support\n• Savings Calculator\n• Warranty & Certifications\n\nOr contact our team directly:\n📞 +82 31-427-1380\n📧 info@kenergy-save.com / info@zera-energy.com\n💬 LINE: @534znjie\n\nWhat would you like to know more about?'
	}

	return (
		<div style={styles.page} suppressHydrationWarning>
			{/* Background Pattern Overlay */}
			<div style={styles.bgPattern}></div>

			{/* Gradient Overlay */}
			<div style={styles.gradientOverlay}></div>

			{/* Background Animation */}
			<div style={styles.bgAnimation}>
				<div style={styles.circle1}></div>
				<div style={styles.circle2}></div>
				<div style={styles.circle3}></div>
			</div>

			<style>{`
				@keyframes float {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-15px); }
				}
				@keyframes pulse {
					0%, 100% { transform: scale(1); opacity: 0.3; }
					50% { transform: scale(1.05); opacity: 0.5; }
				}
				@keyframes slideUp {
					from { opacity: 0; transform: translateY(30px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes moveBackground {
					0% { background-position: 0% 50%; }
					50% { background-position: 100% 50%; }
					100% { background-position: 0% 50%; }
				}
				@keyframes successPulse {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.05); }
				}
			`}</style>

			<main style={styles.container}>
				<button onClick={() => router.push('/Korea/Admin-Login')} style={styles.backButton}>
					← Back
				</button>

				{/* Language Selector */}
				<div style={styles.languageSelector}>
					<button
						onClick={() => handleLanguageChange('en')}
						style={{
							...styles.langButton,
							...(language === 'en' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/24x18/gb.png" alt="UK" style={styles.flagImg} /> EN
					</button>
					<button
						onClick={() => handleLanguageChange('vi')}
						style={{
							...styles.langButton,
							...(language === 'vi' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/24x18/vn.png" alt="Vietnam" style={styles.flagImg} /> VI
					</button>
					<button
						onClick={() => handleLanguageChange('th')}
						style={{
							...styles.langButton,
							...(language === 'th' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/24x18/th.png" alt="Thailand" style={styles.flagImg} /> TH
					</button>
					<button
						onClick={() => handleLanguageChange('ko')}
						style={{
							...styles.langButton,
							...(language === 'ko' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/24x18/kr.png" alt="Korea" style={styles.flagImg} /> KO
					</button>
					<button
						onClick={() => handleLanguageChange('zh')}
						style={{
							...styles.langButton,
							...(language === 'zh' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/24x18/cn.png" alt="China" style={styles.flagImg} /> ZH
					</button>
				</div>

				<div style={styles.card}>
					{/* Header */}
					<div style={styles.header}>
						<div style={styles.logoCircle}>
							<img
								src="/k-energy-save-logo.jpg"
								alt="K Energy Save Logo"
								style={styles.logoImage}
							/>
						</div>
						<h1 style={styles.title}>{t.title}</h1>
						<p style={styles.subtitle}>{t.subtitle}</p>
						<p style={styles.description}>
							{t.description}
						</p>
					</div>

					{/* Success Message */}
					{success && (
						<div style={styles.successBanner}>
							<span style={styles.successIcon}>✓</span>
							<div>
								<div style={styles.successTitle}>{t.successTitle}</div>
								<div style={styles.successText}>
									{t.successMessage}
								</div>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div style={styles.errorBanner}>
							<span style={styles.errorIcon}>⚠️</span>
							{error}
						</div>
					)}

					{/* Contact Form */}
					<form onSubmit={handleSubmit} style={styles.form}>
						<div style={styles.row}>
							<div style={styles.inputGroup}>
								<label style={styles.label}>{t.name} *</label>
								<input
									required
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder={t.namePlaceholder}
									style={styles.input}
								/>
							</div>

							<div style={styles.inputGroup}>
								<label style={styles.label}>{t.email} *</label>
								<input
									required
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder={t.emailPlaceholder}
									style={styles.input}
								/>
							</div>
						</div>

						<div style={styles.row}>
							<div style={styles.inputGroup}>
								<label style={styles.label}>{t.phone} *</label>
								<input
									required
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder={t.phonePlaceholder}
									style={styles.input}
								/>
							</div>

							<div style={styles.inputGroup}>
								<label style={styles.label}>{t.company}</label>
								<input
									type="text"
									name="company"
									value={formData.company}
									onChange={handleChange}
									placeholder={t.companyPlaceholder}
									style={styles.input}
								/>
							</div>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>{t.subject} *</label>
							<select
								required
								name="subject"
								value={formData.subject}
								onChange={handleChange}
								style={styles.select}
							>
								<option value="">{t.selectSubject}</option>
								<option value="product">{t.subjectProduct}</option>
								<option value="support">{t.subjectSupport}</option>
								<option value="quotation">{t.subjectQuotation}</option>
								<option value="partnership">{t.subjectPartnership}</option>
								<option value="other">{t.subjectOther}</option>
							</select>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>{t.message} *</label>
							<textarea
								required
								name="message"
								value={formData.message}
								onChange={handleChange}
								placeholder={t.messagePlaceholder}
								rows={6}
								style={styles.textarea}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							style={{
								...styles.submitButton,
								opacity: loading ? 0.7 : 1,
								cursor: loading ? 'not-allowed' : 'pointer'
							}}
						>
							{loading ? (
								<>
									<span style={styles.spinner}></span>
									{t.sending}
								</>
							) : (
								<>
									{t.submit}
									<span style={styles.sendIcon}>→</span>
								</>
							)}
						</button>
					</form>

					{/* Contact Info */}
					<div style={styles.contactInfo}>
						<div style={styles.divider}></div>
						<h3 style={styles.infoTitle}>{t.otherWays}</h3>
						<div style={styles.infoGrid}>
							<div style={styles.infoItem}>
								<span style={styles.infoIcon}>📞</span>
								<div>
									<div style={styles.infoLabel}>{t.phoneLabel}</div>
									<div style={styles.infoValue}> +82 31-427-1380</div>
								</div>
							</div>
							<div style={styles.infoItem}>
								<span style={styles.infoIcon}>✉️</span>
								<div>
									<div style={styles.infoLabel}>{t.emailLabel}</div>
									<div style={styles.infoValue}>info@kenergy-save.com / info@zera-energy.com</div>
								</div>
							</div>
							<div style={styles.infoItem}>
								<span style={styles.infoIcon}>💬</span>
								<div>
									<div style={styles.infoLabel}>{t.lineLabel}</div>
									<div style={styles.infoValue}>@534znjie</div>
								</div>
							</div>
							<div style={styles.infoItem}>
								<span style={styles.infoIcon}>🕐</span>
								<div>
									<div style={styles.infoLabel}>{t.hoursLabel}</div>
									<div style={styles.infoValue}>{t.hoursValue}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Floating Chatbot Button */}
			{!chatOpen && (
				<button
					onClick={() => setChatOpen(true)}
					style={styles.chatButton}
				>
					<span style={styles.chatButtonIcon}>💬</span>
					<span style={styles.chatButtonText}>{t.chatButton}</span>
				</button>
			)}

			{/* Chat Widget */}
			{chatOpen && (
				<div style={styles.chatWidget}>
					{/* Chat Header */}
					<div style={styles.chatHeader}>
						<div style={styles.chatHeaderInfo}>
							<div style={styles.chatHeaderAvatar}>🤖</div>
							<div style={styles.chatHeaderTitle}>
								<span style={{marginLeft: '8px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
									K Energy Save Co., Ltd. (Group of Zera) Online
								</span>
							</div>
						</div>
						<button
							onClick={() => setChatOpen(false)}
							style={styles.chatCloseButton}
						>
							✕
						</button>
					</div>

					{/* Chat Messages */}
					<div style={styles.chatMessages}>
						{mounted && chatMessages.map((msg, index) => (
							<div
								key={index}
								style={{
									...styles.chatMessage,
									alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
								}}
							>
								<div
									style={{
										...styles.chatBubble,
										...(msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot)
									}}
								>
									{msg.text}
								</div>
							</div>
						))}
						{chatLoading && (
							<div style={styles.chatMessage}>
								<div style={styles.chatBubbleBot}>
									<span style={styles.chatTyping}>●●●</span>
								</div>
							</div>
						)}
					</div>

					{/* Chat Input */}
					<form onSubmit={handleChatSubmit} style={styles.chatInputForm}>
						<input
							type="text"
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							placeholder={t.chatPlaceholder}
							style={styles.chatInput}
						/>
						<button
							type="submit"
							disabled={!chatInput.trim()}
							style={{
								...styles.chatSendButton,
								opacity: !chatInput.trim() ? 0.5 : 1
							}}
						>
							→
						</button>
					</form>
				</div>
			)}
		</div>
	)
}

const styles: { [k: string]: React.CSSProperties } = {
	page: {
		minHeight: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		background: 'linear-gradient(135deg, #064e3b 0%, #047857 25%, #059669 50%, #10b981 75%, #34d399 100%)',
		backgroundSize: '400% 400%',
		animation: 'moveBackground 15s ease infinite',
		padding: '40px 20px',
		overflow: 'hidden'
	},
	bgPattern: {
		position: 'absolute',
		inset: 0,
		backgroundImage: `
			radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
			radial-gradient(circle at 40% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
		`,
		pointerEvents: 'none',
		zIndex: 0
	},
	gradientOverlay: {
		position: 'absolute',
		inset: 0,
		background: 'linear-gradient(180deg, rgba(6, 78, 59, 0.3) 0%, transparent 50%, rgba(4, 120, 87, 0.2) 100%)',
		pointerEvents: 'none',
		zIndex: 1
	},
	bgAnimation: {
		position: 'absolute',
		inset: 0,
		overflow: 'hidden',
		pointerEvents: 'none',
		zIndex: 2
	},
	circle1: {
		position: 'absolute',
		width: 500,
		height: 500,
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.1), transparent)',
		top: '-250px',
		left: '-200px',
		animation: 'pulse 12s ease-in-out infinite',
		filter: 'blur(60px)'
	},
	circle2: {
		position: 'absolute',
		width: 400,
		height: 400,
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.08), transparent)',
		bottom: '-200px',
		right: '-150px',
		animation: 'pulse 14s ease-in-out infinite 3s',
		filter: 'blur(50px)'
	},
	circle3: {
		position: 'absolute',
		width: 350,
		height: 350,
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(209, 250, 229, 0.15), transparent)',
		top: '20%',
		right: '10%',
		animation: 'pulse 10s ease-in-out infinite 5s',
		filter: 'blur(40px)'
	},
	container: {
		width: '100%',
		maxWidth: 900,
		position: 'relative',
		zIndex: 10
	},
	languageSelector: {
		display: 'flex',
		gap: 8,
		justifyContent: 'flex-end',
		marginBottom: 16
	},
	langButton: {
		padding: '10px 16px',
		background: 'rgba(255, 255, 255, 0.9)',
		border: '2px solid rgba(16, 185, 129, 0.2)',
		borderRadius: 10,
		color: '#059669',
		fontSize: 14,
		fontWeight: 600,
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	} as React.CSSProperties,
	langButtonActive: {
		background: 'linear-gradient(135deg, #10b981, #059669)',
		borderColor: '#059669',
		color: '#ffffff',
		transform: 'scale(1.05)',
		boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
	} as React.CSSProperties,
	backButton: {
		marginBottom: 20,
		padding: '12px 24px',
		background: 'rgba(255, 255, 255, 0.95)',
		border: '1px solid rgba(16, 185, 129, 0.2)',
		borderRadius: 12,
		color: '#059669',
		fontSize: 16,
		fontWeight: 600,
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8
	},
	card: {
		background: 'rgba(255, 255, 255, 0.95)',
		backdropFilter: 'blur(30px) saturate(180%)',
		borderRadius: 28,
		padding: '48px 40px',
		boxShadow: `
			0 30px 90px rgba(0, 0, 0, 0.25),
			0 10px 40px rgba(6, 78, 59, 0.2),
			0 0 0 1px rgba(16, 185, 129, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.8)
		`,
		animation: 'slideUp 0.6s ease-out',
		border: '1px solid rgba(16, 185, 129, 0.15)'
	},
	header: {
		textAlign: 'center',
		marginBottom: 40
	},
	logoCircle: {
		width: 140,
		height: 140,
		borderRadius: '50%',
		background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
		margin: '0 auto 20px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: `
			0 12px 40px rgba(16, 185, 129, 0.4),
			0 4px 12px rgba(6, 78, 59, 0.2),
			0 0 0 6px rgba(16, 185, 129, 0.08)
		`,
		animation: 'float 3s ease-in-out infinite',
		padding: 12,
		overflow: 'hidden',
		border: '2px solid rgba(16, 185, 129, 0.2)'
	},
	logoImage: {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		borderRadius: '50%'
	},
	title: {
		margin: 0,
		fontSize: 32,
		fontWeight: 800,
		color: '#064e3b',
		letterSpacing: '-0.5px'
	},
	subtitle: {
		margin: '8px 0',
		fontSize: 18,
		fontWeight: 600,
		color: '#059669'
	},
	description: {
		margin: '12px 0 0 0',
		fontSize: 14,
		color: '#6b7280',
		lineHeight: 1.6
	},
	successBanner: {
		marginBottom: 24,
		padding: 16,
		background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
		border: '2px solid #6ee7b7',
		borderRadius: 16,
		display: 'flex',
		alignItems: 'flex-start',
		gap: 12,
		animation: 'successPulse 2s ease-in-out'
	},
	successIcon: {
		fontSize: 24,
		color: '#059669',
		fontWeight: 'bold'
	},
	successTitle: {
		fontSize: 16,
		fontWeight: 700,
		color: '#047857',
		marginBottom: 4
	},
	successText: {
		fontSize: 14,
		color: '#065f46'
	},
	errorBanner: {
		marginBottom: 24,
		padding: 16,
		background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
		border: '2px solid #fca5a5',
		borderRadius: 16,
		color: '#dc2626',
		fontSize: 14,
		fontWeight: 600,
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	errorIcon: {
		fontSize: 20
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: 20
	},
	row: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 20
	},
	inputGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	label: {
		fontSize: 14,
		fontWeight: 600,
		color: '#065f46'
	},
	input: {
		width: '100%',
		padding: '14px 16px',
		fontSize: 15,
		border: '2px solid #e5e7eb',
		borderRadius: 12,
		outline: 'none',
		transition: 'all 0.3s ease',
		background: '#ffffff',
		color: '#064e3b',
		fontFamily: 'inherit'
	},
	select: {
		width: '100%',
		padding: '14px 16px',
		fontSize: 15,
		border: '2px solid #e5e7eb',
		borderRadius: 12,
		outline: 'none',
		transition: 'all 0.3s ease',
		background: '#ffffff',
		color: '#064e3b',
		fontFamily: 'inherit',
		cursor: 'pointer'
	},
	textarea: {
		width: '100%',
		padding: '14px 16px',
		fontSize: 15,
		border: '2px solid #e5e7eb',
		borderRadius: 12,
		outline: 'none',
		transition: 'all 0.3s ease',
		background: '#ffffff',
		color: '#064e3b',
		fontFamily: 'inherit',
		resize: 'vertical',
		minHeight: 140
	},
	submitButton: {
		marginTop: 8,
		padding: '16px 24px',
		fontSize: 16,
		fontWeight: 700,
		color: '#ffffff',
		background: 'linear-gradient(135deg, #10b981, #059669)',
		border: 'none',
		borderRadius: 12,
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 8px 20px rgba(16, 185, 129, 0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8
	},
	sendIcon: {
		fontSize: 20
	},
	spinner: {
		width: 18,
		height: 18,
		border: '2px solid rgba(255, 255, 255, 0.3)',
		borderTop: '2px solid #ffffff',
		borderRadius: '50%',
		animation: 'pulse 0.8s linear infinite'
	},
	contactInfo: {
		marginTop: 48
	},
	divider: {
		width: 80,
		height: 3,
		background: 'linear-gradient(90deg, #10b981, #059669)',
		margin: '0 auto 32px',
		borderRadius: 2
	},
	infoTitle: {
		margin: '0 0 24px 0',
		fontSize: 20,
		fontWeight: 700,
		color: '#064e3b',
		textAlign: 'center'
	},
	infoGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		gap: 20
	},
	infoItem: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 12,
		padding: 16,
		background: '#f0fdf4',
		borderRadius: 12,
		border: '1px solid #d1fae5'
	},
	infoIcon: {
		fontSize: 24
	},
	infoLabel: {
		fontSize: 12,
		color: '#6b7280',
		marginBottom: 4
	},
	infoValue: {
		fontSize: 14,
		fontWeight: 600,
		color: '#064e3b'
	},
	// Privacy Policy section
	privacySection: {
		marginTop: 32,
		paddingTop: 24,
		borderTop: '2px solid #e5e7eb',
		display: 'flex',
		justifyContent: 'center'
	} as React.CSSProperties,
	privacyButton: {
		padding: '12px 28px',
		background: 'linear-gradient(135deg, #6b7280, #4b5563)',
		border: 'none',
		borderRadius: 12,
		color: '#ffffff',
		fontSize: 15,
		fontWeight: 600,
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
		display: 'flex',
		alignItems: 'center',
		gap: 8
	} as React.CSSProperties,
	// Admin Login section (Easter Egg)
	adminSection: {
		marginTop: 16,
		padding: '20px',
		background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
		borderRadius: 16,
		border: '2px dashed #ef4444',
		display: 'flex',
		justifyContent: 'center',
		animation: 'successPulse 2s ease-in-out infinite'
	} as React.CSSProperties,
	adminButton: {
		padding: '14px 32px',
		background: 'linear-gradient(135deg, #ef4444, #dc2626)',
		border: 'none',
		borderRadius: 12,
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 700,
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
		display: 'flex',
		alignItems: 'center',
		gap: 10
	} as React.CSSProperties,
	// Chatbot styles
	flagImg: {
		width: 24,
		height: 18,
		objectFit: 'cover',
		borderRadius: 3,
		marginRight: 6
	} as React.CSSProperties,

	// Chatbot styles
	chatButton: {
		position: 'fixed',
		bottom: 30,
		right: 30,
		padding: '16px 24px',
		background: 'linear-gradient(135deg, #10b981, #059669)',
		border: 'none',
		borderRadius: 50,
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 600,
		cursor: 'pointer',
		gap: 8,
		boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
		display: 'flex',
		alignItems: 'center',
		zIndex: 1000,
		transition: 'all 0.3s ease'
	} as React.CSSProperties,
	chatButtonIcon: {
		fontSize: 20
	} as React.CSSProperties,
	chatButtonText: {
		fontFamily: 'inherit'
	} as React.CSSProperties,
	chatWidget: {
		position: 'fixed',
		bottom: 30,
		right: 30,
		width: 480,
		height: 650,
		background: '#ffffff',
		borderRadius: 20,
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
		display: 'flex',
		flexDirection: 'column',
		zIndex: 1000,
		overflow: 'hidden',
		border: '1px solid rgba(16, 185, 129, 0.2)'
	} as React.CSSProperties,
	chatHeader: {
		padding: 20,
		background: 'linear-gradient(135deg, #10b981, #059669)',
		color: '#ffffff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	} as React.CSSProperties,
	chatHeaderInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: 12
	} as React.CSSProperties,
	chatHeaderAvatar: {
		width: 45,
		height: 45,
		borderRadius: '50%',
		background: '#ffffff',
		color: '#059669',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 20,
		fontWeight: 700
	} as React.CSSProperties,
	chatHeaderTitle: {
		display: 'flex',
		alignItems: 'center',
		fontSize: 14,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		flex: 1
	} as React.CSSProperties,
	chatHeaderStatus: {
		fontSize: 13,
		opacity: 0.9,
		display: 'flex',
		alignItems: 'center',
		gap: 6
	} as React.CSSProperties,
	chatStatusDot: {
		width: 8,
		height: 8,
		borderRadius: '50%',
		background: '#34d399',
		display: 'inline-block'
	} as React.CSSProperties,
	chatCloseButton: {
		width: 32,
		height: 32,
		borderRadius: '50%',
		background: 'rgba(255, 255, 255, 0.2)',
		border: 'none',
		color: '#ffffff',
		fontSize: 20,
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.2s ease'
	} as React.CSSProperties,
	chatMessages: {
		flex: 1,
		padding: 20,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		background: '#f9fafb'
	} as React.CSSProperties,
	chatMessage: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4
	} as React.CSSProperties,
	chatBubble: {
		maxWidth: '75%',
		padding: '12px 16px',
		borderRadius: 16,
		fontSize: 14,
		lineHeight: 1.5,
		wordWrap: 'break-word',
		whiteSpace: 'pre-wrap'
	} as React.CSSProperties,
	chatBubbleBot: {
		background: '#ffffff',
		color: '#064e3b',
		border: '1px solid #e5e7eb',
		borderBottomLeftRadius: 4
	} as React.CSSProperties,
	chatBubbleUser: {
		background: 'linear-gradient(135deg, #10b981, #059669)',
		color: '#ffffff',
		alignSelf: 'flex-end',
		borderBottomRightRadius: 4
	} as React.CSSProperties,
	chatTyping: {
		fontSize: 20,
		letterSpacing: 2,
		animation: 'pulse 1.5s ease-in-out infinite'
	} as React.CSSProperties,
	chatInputForm: {
		padding: 16,
		background: '#ffffff',
		borderTop: '1px solid #e5e7eb',
		display: 'flex',
		gap: 8
	} as React.CSSProperties,
	chatInput: {
		flex: 1,
		padding: '12px 16px',
		border: '2px solid #e5e7eb',
		borderRadius: 12,
		outline: 'none',
		fontSize: 14,
		fontFamily: 'inherit',
		transition: 'all 0.3s ease'
	} as React.CSSProperties,
	chatSendButton: {
		width: 45,
		height: 45,
		borderRadius: 12,
		background: 'linear-gradient(135deg, #10b981, #059669)',
		border: 'none',
		color: '#ffffff',
		fontSize: 20,
		fontWeight: 700,
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.3s ease'
	} as React.CSSProperties
}
