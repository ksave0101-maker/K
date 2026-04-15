"use client"

import React, { useState, useEffect } from 'react'

export default function HomePage() {
	const [lang, setLang] = useState<'en'|'ko'>(() => {
		if (typeof window !== 'undefined') {
			try { 
				const saved = localStorage.getItem('k_system_home_lang') as 'en' | 'ko'
				return saved || 'en'
			} catch (_) { return 'en' }
		}
		return 'en'
	})

	const toggleLanguage = () => {
		const newLang = lang === 'ko' ? 'en' : 'ko'
		setLang(newLang)
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('k_system_home_lang', newLang)
			} catch (_) {}
		}
	}

	// SVG Flags
	const KoreanFlag = () => (
		<svg width="24" height="16" viewBox="0 0 900 600" style={{ 
			borderRadius: 3, 
			boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
			border: '1px solid rgba(0,0,0,0.08)'
		}}>
			<rect width="900" height="600" fill="#fff"/>
			{/* Taegeuk (Yin-Yang symbol) */}
			<g transform="translate(450,300)">
				<circle r="120" fill="#C60C30"/>
				<path d="M 0,-120 A 60,60 0 0,0 0,0 A 60,60 0 0,1 0,120 A 120,120 0 0,1 0,-120 Z" fill="#003478"/>
				<circle cy="-60" r="15" fill="#C60C30"/>
				<circle cy="60" r="15" fill="#003478"/>
			</g>
			{/* Geon (☰ Heaven - top left) - 3 solid bars */}
			<g transform="translate(270,120)">
				<rect x="-80" y="-30" width="160" height="18" fill="#000"/>
				<rect x="-80" y="0" width="160" height="18" fill="#000"/>
				<rect x="-80" y="30" width="160" height="18" fill="#000"/>
			</g>
			{/* Gon (☷ Earth - bottom left) - 3 broken bars */}
			<g transform="translate(270,480)">
				<rect x="-80" y="-30" width="70" height="18" fill="#000"/>
				<rect x="10" y="-30" width="70" height="18" fill="#000"/>
				<rect x="-80" y="0" width="70" height="18" fill="#000"/>
				<rect x="10" y="0" width="70" height="18" fill="#000"/>
				<rect x="-80" y="30" width="70" height="18" fill="#000"/>
				<rect x="10" y="30" width="70" height="18" fill="#000"/>
			</g>
			{/* Gam (☵ Water - top right) - solid, broken, solid */}
			<g transform="translate(630,120)">
				<rect x="-80" y="-30" width="160" height="18" fill="#000"/>
				<rect x="-80" y="0" width="70" height="18" fill="#000"/>
				<rect x="10" y="0" width="70" height="18" fill="#000"/>
				<rect x="-80" y="30" width="160" height="18" fill="#000"/>
			</g>
			{/* Li (☲ Fire - bottom right) - broken, solid, broken */}
			<g transform="translate(630,480)">
				<rect x="-80" y="-30" width="70" height="18" fill="#000"/>
				<rect x="10" y="-30" width="70" height="18" fill="#000"/>
				<rect x="-80" y="0" width="160" height="18" fill="#000"/>
				<rect x="-80" y="30" width="70" height="18" fill="#000"/>
				<rect x="10" y="30" width="70" height="18" fill="#000"/>
			</g>
		</svg>
	)

	const BritishFlag = () => (
		<svg width="24" height="16" viewBox="0 0 60 30" style={{ 
			borderRadius: 3, 
			boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
			border: '1px solid rgba(0,0,0,0.08)'
		}}>
			<clipPath id="s">
				<path d="M0,0 v30 h60 v-30 z"/>
			</clipPath>
			<clipPath id="t">
				<path d="M30,15 h30 v15 z v-15 h-30 z h-30 v15 z v-15 h30 z"/>
			</clipPath>
			<g clipPath="url(#s)">
				<path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
				<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
				<path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
				<path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
				<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
			</g>
		</svg>
	)

	const t = {
		announcement: {
			en: '🎉 New Update: K-SAVER Max now available for industrial applications!',
			ko: '🎉 새로운 업데이트: K-SAVER Max 산업용 출시!'
		},
		learnMore: { en: 'Learn More →', ko: '더 알아보기 →' },
		heroTitle1: { en: 'ENERGY YOU CAN TRUST', ko: '신뢰할 수 있는 에너지' },
		heroTitle2: { en: '"SAVINGS" YOU CAN SEE', ko: '눈에 보이는 "절약"' },
		heroTagline: {
			en: 'Cut your Electric Bill from day one!\nAdvanced power-saving technology with proven results',
			ko: '첫날부터 전기요금 절감!\n검증된 결과를 제공하는 첨단 절전 기술'
		},
		loginBtn: { en: '🚀 Login to monitoring', ko: '🚀 모니터링 로그인' },
		viewProducts: { en: '📦 View Products', ko: '📦 제품 보기' },
		whyChoose: { en: 'Why Choose K Energy Save?', ko: 'K Energy Save를 선택하는 이유' },
		provenTech: { en: 'Proven Technology', ko: '검증된 기술' },
		provenDesc: { en: 'Validated power saving device with global exports. Certified, eco-friendly, and patented solutions.', ko: '전 세계 수출된 검증된 절전 장치. 인증되고 친환경적인 특허 솔루션.' },
		ecoFriendly: { en: 'Eco Friendly', ko: '친환경' },
		ecoDesc: { en: 'Environmentally conscious solutions that reduce carbon footprint while saving energy.', ko: '에너지를 절약하면서 탄소 발자국을 줄이는 환경 친화적 솔루션.' },
		powerQuality: { en: 'Power Quality', ko: '전력 품질' },
		powerDesc: { en: 'Improves power quality and system reliability, extending equipment lifespan.', ko: '전력 품질과 시스템 신뢰성을 향상시켜 장비 수명을 연장합니다.' },
		certReliab: { en: 'Certified Reliability', ko: '인증된 신뢰성' },
		certDesc: { en: 'Patented solutions trusted across industrial and commercial sectors worldwide.', ko: '전 세계 산업 및 상업 부문에서 신뢰받는 특허 솔루션.' },
		globalImpact: { en: 'Global Impact', ko: '글로벌 영향' },
		globalDesc: { en: 'Exported power-saving devices benefiting multiple countries internationally.', ko: '국제적으로 여러 국가에 혜택을 주는 절전 장치 수출.' },
		savings: { en: '7-15% Savings', ko: '7-15% 절감' },
		savingsDesc: { en: 'Reduces power consumption by blocking excess power and improving efficiency.', ko: '과도한 전력을 차단하고 효율성을 개선하여 전력 소비를 줄입니다.' },
		ourProducts: { en: 'Our Products', ko: '우리의 제품' },
		residential: { en: 'Residential Solution', ko: '주거용 솔루션' },
		commercial: { en: 'Commercial Solution', ko: '상업용 솔루션' },
		industrial: { en: 'Industrial Solution', ko: '산업용 솔루션' },
		perfectHomes: { en: 'Perfect for homes and small offices', ko: '가정 및 소규모 사무실에 적합' },
		idealCommercial: { en: 'Ideal for commercial spaces', ko: '상업 공간에 이상적' },
		highCapacity: { en: 'High-capacity industrial applications', ko: '대용량 산업용 애플리케이션' },
		upTo10kW: { en: 'Up to 10kW capacity', ko: '최대 10kW 용량' },
		upTo30kW: { en: 'Up to 30kW capacity', ko: '최대 30kW 용량' },
		customizable: { en: 'Customizable capacity', ko: '맞춤형 용량' },
		contactUs: { en: 'Contact Us', ko: '문의하기' },
		thailandOffice: { en: 'Thailand Office', ko: '태국 사무소' },
		koreaOffice: { en: 'Korea Office', ko: '한국 사무소' },
		footerRights: { en: '© 2025 K Energy Save Co., Ltd. All rights reserved.', ko: '© 2025 K Energy Save Co., Ltd. 모든 권리 보유.' },
		poweredBy: { en: 'Powered by', ko: '제공:' }
	}

	return (
		<>
			{/* Language Toggle Button */}
			<div style={{
				position: 'fixed',
				top: 16,
				right: 16,
				zIndex: 9999
			}}>
				<button onClick={toggleLanguage} style={{
					padding: '8px 14px',
					borderRadius: 10,
					border: '2px solid #e5e7eb',
					background: '#ffffff',
					color: '#1f2937',
					fontSize: 12,
					fontWeight: 600,
					cursor: 'pointer',
					transition: 'all 0.2s ease',
					boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
				}}
				onMouseOver={e => {
					e.currentTarget.style.background = '#f9fafb'
					e.currentTarget.style.borderColor = '#d1d5db'
					e.currentTarget.style.transform = 'translateY(-1px)'
					e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)'
				}}
				onMouseOut={e => {
					e.currentTarget.style.background = '#ffffff'
					e.currentTarget.style.borderColor = '#e5e7eb'
					e.currentTarget.style.transform = 'translateY(0)'
					e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
				}}>
					{lang === 'ko' ? <KoreanFlag /> : <BritishFlag />}
					<span style={{ 
						fontSize: 12,
						fontWeight: 600,
						color: '#374151',
						letterSpacing: '0.025em'
					}}>
						{lang === 'ko' ? 'English' : '한국어'}
					</span>
				</button>
			</div>

			{/* Announcement Bar */}
			<div className="announcement-bar">
				<div className="announcement-content">
					<i className="bi bi-megaphone-fill"></i>
					<span>{t.announcement[lang]}</span>
					<a href="#products">{t.learnMore[lang]}</a>
				</div>
			</div>

			{/* Hero Section */}
			<section className="hero">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-lg-10 text-center" style={{ position: 'relative', zIndex: 1 }}>
							<div className="logo-hero mx-auto mb-4" style={{ 
								width: 200, 
								height: 200, 
								borderRadius: '50%', 
								overflow: 'hidden',
								boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 8px rgba(255,255,255,0.9)',
								border: '6px solid white',
								background: 'white',
								display: 'inline-block',
								padding: '15px'
							}}>
								<img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ 
									width: '100%', 
									height: '100%', 
									objectFit: 'contain', 
									display: 'block'
								}} />
							</div>
							<div className="emoji-hero mx-auto" style={{ fontSize: '3rem', marginTop: '1rem', marginBottom: '1rem' }}>⚡</div>
							<h1>{t.heroTitle1[lang]}</h1>
							<h2>&quot;{lang === 'ko' ? '절약' : 'SAVINGS'}&quot; {lang === 'ko' ? '눈에 보이는' : 'YOU CAN SEE'}</h2>
							<p className="tagline" style={{ whiteSpace: 'pre-line' }}>
								{t.heroTagline[lang]}
							</p>
							<div className="d-flex gap-3 justify-content-center flex-wrap">
								<a href="https://k-energy.ngrok.app/main-login" className="btn-custom-primary">
									{t.loginBtn[lang]}
								</a>
								<a href="#products" className="btn-custom-secondary">
									{t.viewProducts[lang]}
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-5 bg-light">
				<div className="container py-5">
					<h2 className="section-title">{t.whyChoose[lang]}</h2>
					<div className="row g-4">
						<div className="col-md-6 col-lg-4">
							<div className="feature-card">
								<div className="feature-icon">🔬</div>
								<h3 className="feature-title">{t.provenTech[lang]}</h3>
								<p className="feature-desc">{t.provenDesc[lang]}</p>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="feature-card">
								<div className="feature-icon">🌿</div>
								<h3 className="feature-title">{t.ecoFriendly[lang]}</h3>
								<p className="feature-desc">{t.ecoDesc[lang]}</p>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="feature-card">
								<div className="feature-icon">⚡</div>
								<h3 className="feature-title">{t.powerQuality[lang]}</h3>
								<p className="feature-desc">{t.powerDesc[lang]}</p>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="feature-card">
								<div className="feature-icon">✅</div>
								<h3 className="feature-title">{t.certReliab[lang]}</h3>
								<p className="feature-desc">{t.certDesc[lang]}</p>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="feature-card">
								<div className="feature-icon">🌍</div>
								<h3 className="feature-title">{t.globalImpact[lang]}</h3>
								<p className="feature-desc">{t.globalDesc[lang]}</p>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="feature-card">
								<div className="feature-icon">💰</div>
								<h3 className="feature-title">{t.savings[lang]}</h3>
								<p className="feature-desc">{t.savingsDesc[lang]}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Products Section */}
			<section id="products" className="py-5">
				<div className="container py-5">
					<h2 className="section-title">{t.ourProducts[lang]}</h2>
					<div className="row g-4">
						<div className="col-md-6 col-lg-4">
							<div className="product-card">
								<div className="product-header">
									<h3 className="product-name">K-SAVER 10</h3>
									<p className="mb-0">{t.residential[lang]}</p>
								</div>
								<img src="/k-saver-10.png" alt="K-SAVER 10" style={{ width: '100%', height: '350px', objectFit: 'contain', padding: '20px', background: '#f8f9fa' }} />
								<div className="p-4 text-center">
									<p className="mb-3">{t.perfectHomes[lang]}</p>
									<p className="text-muted mb-0">{t.upTo10kW[lang]}</p>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="product-card">
								<div className="product-header">
									<h3 className="product-name">K-SAVER 30</h3>
									<p className="mb-0">{t.commercial[lang]}</p>
								</div>
								<img src="/k-saver-30.png" alt="K-SAVER 30" style={{ width: '100%', height: '350px', objectFit: 'contain', padding: '20px', background: '#f8f9fa' }} />
								<div className="p-4 text-center">
									<p className="mb-3">{t.idealCommercial[lang]}</p>
									<p className="text-muted mb-0">{t.upTo30kW[lang]}</p>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="product-card">
								<div className="product-header">
									<h3 className="product-name">K-SAVER Max</h3>
									<p className="mb-0">{t.industrial[lang]}</p>
								</div>
								<img src="/k-saver-max.png" alt="K-SAVER Max" style={{ width: '100%', height: '350px', objectFit: 'contain', padding: '20px', background: '#f8f9fa' }} />
								<div className="p-4 text-center">
									<p className="mb-3">{t.highCapacity[lang]}</p>
									<p className="text-muted mb-0">{t.customizable[lang]}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="py-5" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
				<div className="container py-5">
					<h2 className="section-title text-white">{t.contactUs[lang]}</h2>
					<div className="row g-4">
						{/* Thailand Office */}
						<div className="col-lg-6">
							<div className="contact-card">
								<h3>
									<i className="bi bi-geo-alt-fill me-2"></i>
									<img src="https://flagcdn.com/28x21/th.png" alt="Thailand Flag" style={{ width: '28px', height: '21px', marginRight: '8px' }} /> {t.thailandOffice[lang]}
								</h3>
								<div className="text-start">
									<p className="fw-bold mb-3">K Energy Save Co., Ltd.</p>
									<p className="mb-2"><i className="bi bi-building me-2"></i>84 Chaloem Phrakiat Rama 9 Soi 34</p>
									<p className="mb-3">Nong Bon, Prawet<br />Bangkok 10250, Thailand</p>
									<p className="mb-2">
										<i className="bi bi-telephone-fill me-2"></i>
										<a href="tel:+6620808916">+66 2 080 8916</a>
									</p>
									<p className="mb-0">
										<i className="bi bi-envelope-fill me-2"></i>
										<a href="mailto:info@kenergy-save.com">info@kenergy-save.com</a>
									</p>
								</div>
							</div>
						</div>
						
						{/* Korea Office */}
						<div className="col-lg-6">
							<div className="contact-card">
								<h3>
									<i className="bi bi-geo-alt-fill me-2"></i>
									<img src="https://flagcdn.com/28x21/kr.png" alt="Korea Flag" style={{ width: '28px', height: '21px', marginRight: '8px' }} /> {t.koreaOffice[lang]}
								</h3>
								<div className="text-start">
									<p className="fw-bold mb-3">Zera-Energy</p>
									<p className="mb-2"><i className="bi bi-building me-2"></i>2F, 16-10, 166beon-gil</p>
									<p className="mb-3">Elseso-ro, Gunpo-si<br />Gyeonggi-do, Korea</p>
									<p className="mb-2">
										<i className="bi bi-telephone-fill me-2"></i>
										<a href="tel:+82314271380">+82 31-427-1380</a>
									</p>
									<p className="mb-0">
										<i className="bi bi-envelope-fill me-2"></i>
										<a href="mailto:info@zera-energy.com">info@zera-energy.com</a>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-4" style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'center' }}>
				<div className="container">
					<p className="mb-2">{t.footerRights[lang]}</p>
					<p className="mb-0">{t.poweredBy[lang]} <a href="https://kenergy-save.com" style={{ color: '#fbbf24', textDecoration: 'none' }}>K Energy Save</a></p>
				</div>
			</footer>
		</>
	)
}
