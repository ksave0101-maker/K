"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicyPage() {
	const router = useRouter()
	const [language, setLanguage] = useState<'en' | 'th' | 'ko' | 'zh'>('en')

	// Easter Egg state for admin login button
	const [showAdminButton, setShowAdminButton] = useState(false)

	// Easter Egg: Ctrl+Alt+L to show admin login button
	React.useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') {
				e.preventDefault()
				setShowAdminButton(prev => !prev)
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [])

	const translations = {
		en: {
			title: 'Privacy Policy',
			lastUpdated: 'Last Updated: January 13, 2026',
			introduction: 'Introduction',
			introText: 'K Energy Save Co., Ltd. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.',
			informationWeCollect: 'Information We Collect',
			personalInfo: 'Personal Information',
			personalInfoText: 'We may collect personal information that you voluntarily provide to us when you:',
			personalInfoList: [
				'Fill out our contact form (name, email, phone number, company name)',
				'Request a quotation or product information',
				'Subscribe to our newsletter or communications',
				'Contact us for technical support',
				'Participate in surveys or promotions'
			],
			automaticInfo: 'Automatically Collected Information',
			automaticInfoText: 'When you visit our website, we may automatically collect certain information about your device, including:',
			automaticInfoList: [
				'IP address and browser type',
				'Operating system and device information',
				'Pages visited and time spent on pages',
				'Referring website addresses',
				'Cookies and similar tracking technologies'
			],
			howWeUse: 'How We Use Your Information',
			howWeUseText: 'We use the information we collect to:',
			howWeUseList: [
				'Respond to your inquiries and provide customer support',
				'Process quotation requests and business partnerships',
				'Send product information and promotional materials (with your consent)',
				'Improve our website and services',
				'Analyze usage patterns and optimize user experience',
				'Comply with legal obligations and prevent fraud'
			],
			informationSharing: 'Information Sharing and Disclosure',
			informationSharingText: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
			informationSharingList: [
				'With service providers who assist us in operating our website and conducting our business',
				'When required by law or to protect our rights and safety',
				'With your explicit consent',
				'In connection with a business transfer or merger'
			],
			dataSecurity: 'Data Security',
			dataSecurityText: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.',
			cookies: 'Cookies and Tracking Technologies',
			cookiesText: 'We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.',
			yourRights: 'Your Rights',
			yourRightsText: 'Depending on your location, you may have the following rights:',
			yourRightsList: [
				'Access to your personal information',
				'Correction of inaccurate information',
				'Deletion of your personal information',
				'Objection to processing of your information',
				'Data portability',
				'Withdrawal of consent'
			],
			thirdPartyLinks: 'Third-Party Links',
			thirdPartyLinksText: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.',
			childrenPrivacy: 'Children\'s Privacy',
			childrenPrivacyText: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.',
			international: 'International Data Transfers',
			internationalText: 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.',
			changes: 'Changes to This Privacy Policy',
			changesText: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated "Last Updated" date.',
			contact: 'Contact Us',
			contactText: 'If you have any questions or concerns about this Privacy Policy, please contact us:',
			contactInfo: [
				'Phone: +82 31-427-1380',
				'Email: info@kenergy-save.com / info@zera-energy.com',
				'LINE Official: @534znjie',
				'Business Hours: Monday - Friday, 9:00 AM - 6:00 PM'
			],
			dataRetention: 'Data Retention',
			dataRetentionText: 'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.',
			backButton: 'Back to Home',
			adminLogin: 'Admin Login'
		},
		th: {
			title: 'นโยบายความเป็นส่วนตัว',
			lastUpdated: 'อัพเดทล่าสุด: 13 มกราคม 2569',
			introduction: 'บทนำ',
			introText: 'บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด ("เรา" หรือ "บริษัท") มุ่งมั่นที่จะปกป้องความเป็นส่วนตัวของคุณ นโยบายความเป็นส่วนตัวนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลของคุณเมื่อคุณเข้าชมเว็บไซต์หรือใช้บริการของเรา',
			informationWeCollect: 'ข้อมูลที่เราเก็บรวบรวม',
			personalInfo: 'ข้อมูลส่วนบุคคล',
			personalInfoText: 'เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลที่คุณให้แก่เราโดยสมัครใจเมื่อคุณ:',
			personalInfoList: [
				'กรอกแบบฟอร์มติดต่อของเรา (ชื่อ อีเมล เบอร์โทรศัพท์ ชื่อบริษัท)',
				'ขอใบเสนอราคาหรือข้อมูลผลิตภัณฑ์',
				'สมัครรับจดหมายข่าวหรือการสื่อสารของเรา',
				'ติดต่อเราเพื่อขอความช่วยเหลือทางเทคนิค',
				'เข้าร่วมแบบสำรวจหรือโปรโมชัน'
			],
			automaticInfo: 'ข้อมูลที่เก็บรวบรวมโดยอัตโนมัติ',
			automaticInfoText: 'เมื่อคุณเข้าชมเว็บไซต์ของเรา เราอาจเก็บรวบรวมข้อมูลบางอย่างเกี่ยวกับอุปกรณ์ของคุณโดยอัตโนมัติ ได้แก่:',
			automaticInfoList: [
				'ที่อยู่ IP และประเภทเบราว์เซอร์',
				'ระบบปฏิบัติการและข้อมูลอุปกรณ์',
				'หน้าที่เข้าชมและเวลาที่ใช้ในแต่ละหน้า',
				'ที่อยู่เว็บไซต์อ้างอิง',
				'คุกกี้และเทคโนโลยีติดตามที่คล้ายกัน'
			],
			howWeUse: 'วิธีที่เราใช้ข้อมูลของคุณ',
			howWeUseText: 'เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:',
			howWeUseList: [
				'ตอบคำถามของคุณและให้การสนับสนุนลูกค้า',
				'ดำเนินการตามคำขอใบเสนอราคาและความร่วมมือทางธุรกิจ',
				'ส่งข้อมูลผลิตภัณฑ์และสื่อส่งเสริมการขาย (โดยได้รับความยินยอมจากคุณ)',
				'ปรับปรุงเว็บไซต์และบริการของเรา',
				'วิเคราะห์รูปแบบการใช้งานและปรับปรุงประสบการณ์ผู้ใช้',
				'ปฏิบัติตามภาระผูกพันทางกฎหมายและป้องกันการฉ้อโกง'
			],
			informationSharing: 'การแบ่งปันและเปิดเผยข้อมูล',
			informationSharingText: 'เราไม่ขาย แลกเปลี่ยน หรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม เราอาจแบ่งปันข้อมูลของคุณเฉพาะในกรณีต่อไปนี้เท่านั้น:',
			informationSharingList: [
				'กับผู้ให้บริการที่ช่วยเราในการดำเนินงานเว็บไซต์และธุรกิจ',
				'เมื่อกฎหมายกำหนดหรือเพื่อปกป้องสิทธิและความปลอดภัยของเรา',
				'โดยได้รับความยินยอมโดยชัดแจ้งจากคุณ',
				'ในกรณีที่มีการโอนธุรกิจหรือการควบรวมกิจการ'
			],
			dataSecurity: 'ความปลอดภัยของข้อมูล',
			dataSecurityText: 'เราใช้มาตรการทางเทคนิคและองค์กรที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึง แก้ไข เปิดเผย หรือทำลายโดยไม่ได้รับอนุญาต อย่างไรก็ตาม ไม่มีวิธีการส่งข้อมูลผ่านอินเทอร์เน็ตใดที่ปลอดภัย 100%',
			cookies: 'คุกกี้และเทคโนโลยีติดตาม',
			cookiesText: 'เราใช้คุกกี้และเทคโนโลยีติดตามที่คล้ายกันเพื่อปรับปรุงประสบการณ์ของคุณบนเว็บไซต์ คุณสามารถควบคุมการตั้งค่าคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ของคุณ',
			yourRights: 'สิทธิของคุณ',
			yourRightsText: 'ขึ้นอยู่กับสถานที่ของคุณ คุณอาจมีสิทธิต่อไปนี้:',
			yourRightsList: [
				'เข้าถึงข้อมูลส่วนบุคคลของคุณ',
				'แก้ไขข้อมูลที่ไม่ถูกต้อง',
				'ลบข้อมูลส่วนบุคคลของคุณ',
				'คัดค้านการประมวลผลข้อมูลของคุณ',
				'การพกพาข้อมูล',
				'ถอนความยินยอม'
			],
			thirdPartyLinks: 'ลิงก์บุคคลที่สาม',
			thirdPartyLinksText: 'เว็บไซต์ของเราอาจมีลิงก์ไปยังเว็บไซต์บุคคลที่สาม เราไม่รับผิดชอบต่อแนวปฏิบัติด้านความเป็นส่วนตัวของเว็บไซต์ภายนอกเหล่านี้ เราแนะนำให้คุณอ่านนโยบายความเป็นส่วนตัวของพวกเขา',
			childrenPrivacy: 'ความเป็นส่วนตัวของเด็ก',
			childrenPrivacyText: 'บริการของเราไม่ได้มุ่งหมายสำหรับบุคคลที่มีอายุต่ำกว่า 18 ปี เราไม่เก็บรวบรวมข้อมูลส่วนบุคคลจากเด็กโดยรู้เท่าทัน',
			international: 'การโอนข้อมูลระหว่างประเทศ',
			internationalText: 'ข้อมูลของคุณอาจถูกโอนและประมวลผลในประเทศอื่นนอกเหนือจากประเทศที่คุณพำนักอาศัย เราจะมั่นใจว่ามีมาตรการป้องกันที่เหมาะสมสำหรับการโอนดังกล่าว',
			changes: 'การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว',
			changesText: 'เราอาจอัพเดทนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว เราจะแจ้งให้คุณทราบถึงการเปลี่ยนแปลงใดๆ โดยการโพสต์นโยบายความเป็นส่วนตัวใหม่บนหน้านี้พร้อมวันที่ "อัพเดทล่าสุด" ที่ปรับปรุงแล้ว',
			contact: 'ติดต่อเรา',
			contactText: 'หากคุณมีคำถามหรือข้อกังวลเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเรา:',
			contactInfo: [
				'โทรศัพท์: +82 31-427-1380',
				'อีเมล: info@kenergy-save.com / info@zera-energy.com',
				'ไลน์ทางการ: @534znjie',
				'เวลาทำการ: จันทร์ - ศุกร์ 9:00 - 18:00 น.'
			],
			dataRetention: 'การเก็บรักษาข้อมูล',
			dataRetentionText: 'เราเก็บรักษาข้อมูลส่วนบุคคลของคุณเฉพาะเท่าที่จำเป็นเพื่อบรรลุวัตถุประสงค์ที่ระบุไว้ในนโยบายความเป็นส่วนตัวนี้ เว้นแต่กฎหมายจะกำหนดหรืออนุญาตให้เก็บรักษาไว้นานกว่านั้น',
			backButton: 'กลับไปหน้าแรก',
			adminLogin: 'เข้าสู่ระบบผู้ดูแล'
		},
		ko: {
			title: '개인정보 처리방침',
			lastUpdated: '최종 업데이트: 2026년 1월 13일',
			introduction: '소개',
			introText: 'K 에너지 세이브 주식회사("당사")는 귀하의 개인정보를 보호하기 위해 최선을 다하고 있습니다. 본 개인정보 처리방침은 귀하가 당사 웹사이트를 방문하거나 서비스를 이용할 때 당사가 귀하의 정보를 수집, 사용, 공개 및 보호하는 방법을 설명합니다.',
			informationWeCollect: '수집하는 정보',
			personalInfo: '개인정보',
			personalInfoText: '다음의 경우 귀하가 자발적으로 제공하는 개인정보를 수집할 수 있습니다:',
			personalInfoList: [
				'문의 양식 작성 시 (이름, 이메일, 전화번호, 회사명)',
				'견적 또는 제품 정보 요청',
				'뉴스레터 또는 커뮤니케이션 구독',
				'기술 지원 문의',
				'설문조사 또는 프로모션 참여'
			],
			automaticInfo: '자동 수집 정보',
			automaticInfoText: '웹사이트 방문 시 다음과 같은 기기 정보를 자동으로 수집할 수 있습니다:',
			automaticInfoList: [
				'IP 주소 및 브라우저 유형',
				'운영 체제 및 기기 정보',
				'방문한 페이지 및 페이지 체류 시간',
				'참조 웹사이트 주소',
				'쿠키 및 유사한 추적 기술'
			],
			howWeUse: '정보 사용 방법',
			howWeUseText: '수집한 정보는 다음과 같이 사용됩니다:',
			howWeUseList: [
				'문의 응답 및 고객 지원 제공',
				'견적 요청 및 비즈니스 파트너십 처리',
				'제품 정보 및 프로모션 자료 발송 (동의 시)',
				'웹사이트 및 서비스 개선',
				'사용 패턴 분석 및 사용자 경험 최적화',
				'법적 의무 준수 및 사기 방지'
			],
			informationSharing: '정보 공유 및 공개',
			informationSharingText: '당사는 귀하의 개인정보를 제3자에게 판매, 거래 또는 임대하지 않습니다. 다음의 경우에만 정보를 공유할 수 있습니다:',
			informationSharingList: [
				'웹사이트 운영 및 비즈니스 수행을 지원하는 서비스 제공업체',
				'법률에 의해 요구되거나 당사의 권리와 안전을 보호하기 위해',
				'귀하의 명시적 동의가 있는 경우',
				'비즈니스 이전 또는 합병과 관련하여'
			],
			dataSecurity: '데이터 보안',
			dataSecurityText: '당사는 무단 접근, 변경, 공개 또는 파괴로부터 귀하의 개인정보를 보호하기 위해 적절한 기술적 및 조직적 조치를 시행합니다. 그러나 인터넷을 통한 전송 방법은 100% 안전하지 않습니다.',
			cookies: '쿠키 및 추적 기술',
			cookiesText: '당사는 웹사이트에서의 경험을 향상시키기 위해 쿠키 및 유사한 추적 기술을 사용합니다. 브라우저 설정을 통해 쿠키 설정을 제어할 수 있습니다.',
			yourRights: '귀하의 권리',
			yourRightsText: '귀하의 위치에 따라 다음과 같은 권리를 가질 수 있습니다:',
			yourRightsList: [
				'개인정보에 대한 접근',
				'부정확한 정보의 정정',
				'개인정보 삭제',
				'정보 처리에 대한 반대',
				'데이터 이동성',
				'동의 철회'
			],
			thirdPartyLinks: '제3자 링크',
			thirdPartyLinksText: '당사 웹사이트에는 제3자 웹사이트로의 링크가 포함될 수 있습니다. 당사는 이러한 외부 사이트의 개인정보 보호 관행에 대해 책임지지 않습니다. 해당 사이트의 개인정보 처리방침을 읽어보시기 바랍니다.',
			childrenPrivacy: '아동 개인정보 보호',
			childrenPrivacyText: '당사의 서비스는 18세 미만의 개인을 대상으로 하지 않습니다. 당사는 고의로 아동으로부터 개인정보를 수집하지 않습니다.',
			international: '국제 데이터 전송',
			internationalText: '귀하의 정보는 거주 국가 이외의 국가로 전송되어 처리될 수 있습니다. 당사는 이러한 전송에 대해 적절한 보호 조치가 마련되어 있는지 확인합니다.',
			changes: '개인정보 처리방침 변경',
			changesText: '당사는 본 개인정보 처리방침을 수시로 업데이트할 수 있습니다. 변경 사항이 있는 경우 업데이트된 "최종 업데이트" 날짜와 함께 이 페이지에 새로운 개인정보 처리방침을 게시하여 알려드립니다.',
			contact: '문의하기',
			contactText: '본 개인정보 처리방침에 대한 질문이나 우려사항이 있으시면 문의해 주세요:',
			contactInfo: [
				'전화: +82 31-427-1380',
				'이메일: info@kenergy-save.com / info@zera-energy.com',
				'LINE 공식: @534znjie',
				'영업 시간: 월요일 - 금요일 오전 9시 - 오후 6시'
			],
			dataRetention: '데이터 보존',
			dataRetentionText: '당사는 본 개인정보 처리방침에 명시된 목적을 달성하는 데 필요한 기간 동안만 귀하의 개인정보를 보존하며, 법률에 의해 더 긴 보존 기간이 요구되거나 허용되지 않는 한 그러합니다.',
			backButton: '홈으로 돌아가기',
			adminLogin: '관리자 로그인'
		},
		zh: {
			title: '隐私政策',
			lastUpdated: '最后更新：2026年1月13日',
			introduction: '简介',
			introText: 'K 能源节省有限公司（"我们"或"公司"）致力于保护您的隐私。本隐私政策说明了当您访问我们的网站或使用我们的服务时，我们如何收集、使用、披露和保护您的信息。',
			informationWeCollect: '我们收集的信息',
			personalInfo: '个人信息',
			personalInfoText: '当您进行以下操作时，我们可能会收集您自愿提供的个人信息：',
			personalInfoList: [
				'填写我们的联系表格（姓名、电子邮件、电话号码、公司名称）',
				'索取报价或产品信息',
				'订阅我们的新闻通讯或通信',
				'联系我们寻求技术支持',
				'参与调查或促销活动'
			],
			automaticInfo: '自动收集的信息',
			automaticInfoText: '当您访问我们的网站时，我们可能会自动收集有关您设备的某些信息，包括：',
			automaticInfoList: [
				'IP地址和浏览器类型',
				'操作系统和设备信息',
				'访问的页面和页面停留时间',
				'引荐网站地址',
				'Cookie和类似的追踪技术'
			],
			howWeUse: '我们如何使用您的信息',
			howWeUseText: '我们使用收集的信息来：',
			howWeUseList: [
				'回应您的咨询并提供客户支持',
				'处理报价请求和业务合作伙伴关系',
				'发送产品信息和促销材料（经您同意）',
				'改进我们的网站和服务',
				'分析使用模式并优化用户体验',
				'遵守法律义务并防止欺诈'
			],
			informationSharing: '信息共享和披露',
			informationSharingText: '我们不会向第三方出售、交易或出租您的个人信息。我们仅在以下情况下共享您的信息：',
			informationSharingList: [
				'与协助我们运营网站和开展业务的服务提供商',
				'当法律要求或为保护我们的权利和安全时',
				'经您明确同意',
				'与业务转让或合并有关'
			],
			dataSecurity: '数据安全',
			dataSecurityText: '我们实施适当的技术和组织措施，以保护您的个人信息免受未经授权的访问、更改、披露或销毁。但是，通过互联网传输的方法并非100%安全。',
			cookies: 'Cookie和追踪技术',
			cookiesText: '我们使用Cookie和类似的追踪技术来增强您在我们网站上的体验。您可以通过浏览器偏好设置控制Cookie设置。',
			yourRights: '您的权利',
			yourRightsText: '根据您所在的位置，您可能享有以下权利：',
			yourRightsList: [
				'访问您的个人信息',
				'更正不准确的信息',
				'删除您的个人信息',
				'反对处理您的信息',
				'数据可移植性',
				'撤回同意'
			],
			thirdPartyLinks: '第三方链接',
			thirdPartyLinksText: '我们的网站可能包含第三方网站的链接。我们不对这些外部网站的隐私做法负责。我们鼓励您阅读其隐私政策。',
			childrenPrivacy: '儿童隐私',
			childrenPrivacyText: '我们的服务不针对18岁以下的个人。我们不会故意收集儿童的个人信息。',
			international: '国际数据传输',
			internationalText: '您的信息可能会被传输到您居住国以外的国家并在那里处理。我们确保为此类传输提供适当的保护措施。',
			changes: '隐私政策的变更',
			changesText: '我们可能会不时更新本隐私政策。我们将通过在本页面上发布新的隐私政策并更新"最后更新"日期来通知您任何更改。',
			contact: '联系我们',
			contactText: '如果您对本隐私政策有任何疑问或担忧，请联系我们：',
			contactInfo: [
				'电话：+82 31-427-1380',
				'电子邮件：info@kenergy-save.com / info@zera-energy.com',
				'LINE 官方：@534znjie',
				'营业时间：周一至周五 上午9:00 - 下午6:00'
			],
			dataRetention: '数据保留',
			dataRetentionText: '我们仅在必要的时间内保留您的个人信息，以实现本隐私政策中概述的目的，除非法律要求或允许更长的保留期限。',
			backButton: '返回首页',
			adminLogin: '管理员登录'
		}
	}

	const t = translations[language]

	return (
		<div style={styles.page}>
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
					0%, 100% { transform: scale(1); opacity: 1; }
					50% { transform: scale(1.02); opacity: 0.9; }
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
			`}</style>

			<main style={styles.container}>
				{/* Language Selector */}
				<div style={styles.languageSelector}>
					<button
						onClick={() => setLanguage('en')}
						style={{
							...styles.langButton,
							...(language === 'en' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/20x15/gb.png" alt="EN" style={{ width: '20px', height: '15px', marginRight: '6px' }} /> EN
					</button>
					<button
						onClick={() => setLanguage('th')}
						style={{
							...styles.langButton,
							...(language === 'th' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/20x15/th.png" alt="TH" style={{ width: '20px', height: '15px', marginRight: '6px' }} /> TH
					</button>
					<button
						onClick={() => setLanguage('ko')}
						style={{
							...styles.langButton,
							...(language === 'ko' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/20x15/kr.png" alt="KO" style={{ width: '20px', height: '15px', marginRight: '6px' }} /> KO
					</button>
					<button
						onClick={() => setLanguage('zh')}
						style={{
							...styles.langButton,
							...(language === 'zh' ? styles.langButtonActive : {})
						}}
					>
						<img src="https://flagcdn.com/20x15/cn.png" alt="ZH" style={{ width: '20px', height: '15px', marginRight: '6px' }} /> ZH
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
						<p style={styles.lastUpdated}>{t.lastUpdated}</p>
					</div>

					{/* Content */}
					<div style={styles.content}>
						{/* Introduction */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.introduction}</h2>
							<p style={styles.paragraph}>{t.introText}</p>
						</section>

						{/* Information We Collect */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.informationWeCollect}</h2>

							<h3 style={styles.subTitle}>{t.personalInfo}</h3>
							<p style={styles.paragraph}>{t.personalInfoText}</p>
							<ul style={styles.list}>
								{t.personalInfoList.map((item, index) => (
									<li key={index} style={styles.listItem}>{item}</li>
								))}
							</ul>

							<h3 style={styles.subTitle}>{t.automaticInfo}</h3>
							<p style={styles.paragraph}>{t.automaticInfoText}</p>
							<ul style={styles.list}>
								{t.automaticInfoList.map((item, index) => (
									<li key={index} style={styles.listItem}>{item}</li>
								))}
							</ul>
						</section>

						{/* How We Use Your Information */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.howWeUse}</h2>
							<p style={styles.paragraph}>{t.howWeUseText}</p>
							<ul style={styles.list}>
								{t.howWeUseList.map((item, index) => (
									<li key={index} style={styles.listItem}>{item}</li>
								))}
							</ul>
						</section>

						{/* Information Sharing */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.informationSharing}</h2>
							<p style={styles.paragraph}>{t.informationSharingText}</p>
							<ul style={styles.list}>
								{t.informationSharingList.map((item, index) => (
									<li key={index} style={styles.listItem}>{item}</li>
								))}
							</ul>
						</section>

						{/* Data Security */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.dataSecurity}</h2>
							<p style={styles.paragraph}>{t.dataSecurityText}</p>
						</section>

						{/* Cookies */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.cookies}</h2>
							<p style={styles.paragraph}>{t.cookiesText}</p>
						</section>

						{/* Your Rights */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.yourRights}</h2>
							<p style={styles.paragraph}>{t.yourRightsText}</p>
							<ul style={styles.list}>
								{t.yourRightsList.map((item, index) => (
									<li key={index} style={styles.listItem}>{item}</li>
								))}
							</ul>
						</section>

						{/* Data Retention */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.dataRetention}</h2>
							<p style={styles.paragraph}>{t.dataRetentionText}</p>
						</section>

						{/* Third Party Links */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.thirdPartyLinks}</h2>
							<p style={styles.paragraph}>{t.thirdPartyLinksText}</p>
						</section>

						{/* Children's Privacy */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.childrenPrivacy}</h2>
							<p style={styles.paragraph}>{t.childrenPrivacyText}</p>
						</section>

						{/* International Data Transfers */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.international}</h2>
							<p style={styles.paragraph}>{t.internationalText}</p>
						</section>

						{/* Changes to Privacy Policy */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.changes}</h2>
							<p style={styles.paragraph}>{t.changesText}</p>
						</section>

						{/* Contact Us */}
						<section style={styles.section}>
							<h2 style={styles.sectionTitle}>{t.contact}</h2>
							<p style={styles.paragraph}>{t.contactText}</p>
							<div style={styles.contactBox}>
								{t.contactInfo.map((item, index) => (
									<p key={index} style={styles.contactItem}>{item}</p>
								))}
							</div>
						</section>
					</div>

					{/* Back Button */}
					<div style={styles.buttonContainer}>
						<button
							onClick={() => router.push('/')}
							style={styles.backButton}
						>
							← {t.backButton}
						</button>
					</div>

					{/* Hidden Admin Login Button (Easter Egg: Ctrl+Alt+L) */}
					{showAdminButton && (
						<div style={styles.adminSection}>
							<button
								onClick={() => router.push('/admin/adminsystem')}
								style={styles.adminButton}
							>
								🔐 {t.adminLogin}
							</button>
						</div>
					)}
				</div>
			</main>
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
		maxWidth: 1000,
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
		marginBottom: 40,
		paddingBottom: 24,
		borderBottom: '2px solid #e5e7eb'
	},
	logoCircle: {
		width: 120,
		height: 120,
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
		fontSize: 36,
		fontWeight: 800,
		color: '#064e3b',
		letterSpacing: '-0.5px'
	},
	lastUpdated: {
		margin: '12px 0 0 0',
		fontSize: 14,
		color: '#6b7280',
		fontStyle: 'italic'
	},
	content: {
		maxHeight: '60vh',
		overflowY: 'auto',
		paddingRight: 16,
		marginBottom: 24
	},
	section: {
		marginBottom: 32
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: 700,
		color: '#064e3b',
		marginBottom: 12,
		paddingBottom: 8,
		borderBottom: '2px solid #d1fae5'
	},
	subTitle: {
		fontSize: 18,
		fontWeight: 600,
		color: '#059669',
		marginTop: 20,
		marginBottom: 8
	},
	paragraph: {
		fontSize: 17,
		lineHeight: 1.7,
		color: '#374151',
		marginBottom: 12
	},
	list: {
		marginLeft: 24,
		marginTop: 12,
		marginBottom: 12
	},
	listItem: {
		fontSize: 17,
		lineHeight: 1.7,
		color: '#374151',
		marginBottom: 8
	},
	contactBox: {
		marginTop: 16,
		padding: 20,
		background: '#f0fdf4',
		borderRadius: 12,
		border: '2px solid #d1fae5'
	},
	contactItem: {
		fontSize: 17,
		lineHeight: 1.8,
		color: '#064e3b',
		margin: '8px 0',
		fontWeight: 500
	},
	buttonContainer: {
		display: 'flex',
		justifyContent: 'center',
		paddingTop: 24,
		borderTop: '2px solid #e5e7eb'
	},
	backButton: {
		padding: '14px 32px',
		background: 'linear-gradient(135deg, #10b981, #059669)',
		border: 'none',
		borderRadius: 12,
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 700,
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 8px 20px rgba(16, 185, 129, 0.5)',
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8
	},
	// Admin Login section (Easter Egg)
	adminSection: {
		marginTop: 24,
		padding: '20px',
		background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
		borderRadius: 16,
		border: '2px dashed #ef4444',
		display: 'flex',
		justifyContent: 'center',
		animation: 'pulse 2s ease-in-out infinite'
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
	} as React.CSSProperties
}
