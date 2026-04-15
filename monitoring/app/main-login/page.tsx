"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserLogin() {
	const router = useRouter()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [site, setSite] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [pressed, setPressed] = useState(false)
	const [success, setSuccess] = useState(false)
	const [focusedInput, setFocusedInput] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			const res = await fetch('/api/user/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password, site })
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || res.statusText)
			}

			const data = await res.json()
			if (data && data.token) {
				try {
					localStorage.setItem('k_system_user_token', data.token)
					localStorage.setItem('k_system_user', JSON.stringify({
						userId: data.userId,
						username: data.username,
						name: data.name,
						email: data.email,
						site: data.site
					}))
				} catch (err) {
					console.error('failed to save token', err)
				}

				// Show success animation
				setSuccess(true)

			// Wait for animation then redirect: Thailand users -> Admin dashboard, others -> sites
			setTimeout(() => {
				try {
					const userSite = (data && data.site || '').toString().toLowerCase().trim()
					// Show success notification
					try {
						const toast = document.createElement('div')
						toast.style.cssText = `
							position: fixed;
							top: 20px;
							right: 20px;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							padding: 16px 24px;
							border-radius: 12px;
							box-shadow: 0 4px 20px rgba(0,0,0,0.3);
							z-index: 9999;
							font-family: system-ui, -apple-system, sans-serif;
							font-size: 14px;
							animation: slideIn 0.3s ease-out;
						`
						toast.innerHTML = `
							<div style="display: flex; align-items: center; gap: 12px;">
								<div style="font-size: 24px;">✅</div>
								<div>
									<div style="font-weight: 600; margin-bottom: 4px;">Login Successful!</div>
									<div style="font-size: 13px; opacity: 0.95;">Welcome ${data.username} from ${userSite}</div>
								</div>
							</div>
						`
						document.body.appendChild(toast)

						// Add animation
						const style = document.createElement('style')
						style.textContent = `
							@keyframes slideIn {
								from { transform: translateX(400px); opacity: 0; }
								to { transform: translateX(0); opacity: 1; }
							}
						`
						document.head.appendChild(style)

						// Auto remove after 1.2 seconds (before redirect at 1.5s)
						setTimeout(() => {
							toast.style.animation = 'slideIn 0.3s ease-out reverse'
							setTimeout(() => toast.remove(), 300)
						}, 1200)
					} catch(_) {}
					if (userSite === 'thailand') {
						router.push('/Thailand/Admin-Login/dashboard')
					} else {
						router.push('/Admin-Login')
					}
				} catch (err) {
					router.push('/Admin-Login')
				}
			}, 1500)
			return
			}

			throw new Error('Invalid response from server')
		} catch (err: any) {
			setError(err?.message || 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={styles.page}>
			{/* Background Animation */}
			<div style={styles.bgAnimation}>
				<div style={styles.circle1}></div>
				<div style={styles.circle2}></div>
				<div style={styles.circle3}></div>
			</div>

			<style>{`
				@keyframes checkmark {
					0% { stroke-dashoffset: 100; opacity: 0; }
					50% { stroke-dashoffset: 0; opacity: 1; }
					100% { stroke-dashoffset: 0; opacity: 1; }
				}
				@keyframes scaleIn {
					0% { transform: scale(0); opacity: 0; }
					50% { transform: scale(1.1); }
					100% { transform: scale(1); opacity: 1; }
				}
				@keyframes float {
					0%, 100% { transform: translateY(0) rotate(0deg); }
					50% { transform: translateY(-20px) rotate(5deg); }
				}
				@keyframes pulse {
					0%, 100% { transform: scale(1); opacity: 0.3; }
					50% { transform: scale(1.05); opacity: 0.5; }
				}
				@keyframes slideUp {
					from { opacity: 0; transform: translateY(30px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>

			{/* Success Overlay */}
			{success && (
				<div style={styles.successOverlay}>
					<div style={styles.successCard}>
						<svg width="80" height="80" viewBox="0 0 100 100">
							<circle cx="50" cy="50" r="45" fill="#10b981" style={{ animation: 'scaleIn 0.5s ease' }} />
							<path
								d="M 30 50 L 45 65 L 70 35"
								stroke="white"
								strokeWidth="8"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{
									strokeDasharray: 100,
									strokeDashoffset: 100,
									animation: 'checkmark 0.8s ease forwards 0.3s'
								}}
							/>
						</svg>
						<div style={styles.successText}>Login Successful!</div>
						<div style={styles.successSubtext}>Redirecting to dashboard...</div>
					</div>
				</div>
			)}

			<main style={styles.card}>
				{/* Logo Section */}
				<div style={styles.logoSection}>
					<div style={styles.logoCircle}>
						<img
							src="/k-energy-save-logo.jpg"
							alt="K Energy Save Logo"
							style={styles.logoImage}
						/>
					</div>
					<h1 style={styles.brandName}>K Energy Save Co., Ltd</h1>
					<p style={styles.tagline}>ENERGY...YOU CAN TRUST.</p>
					<p style={styles.subTagline}>"SAVINGS" YOU CAN SEE.</p>
					<div style={styles.divider}></div>
				</div>

				<form onSubmit={handleSubmit} style={styles.form}>
					<h2 style={styles.formTitle}>Login</h2>

					{/* Username Input */}
					<div style={styles.inputGroup}>
						<label style={styles.label}>
							<span style={styles.labelIcon}>👤</span>
							Username
						</label>
						<input
							required
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onFocus={() => setFocusedInput('username')}
							onBlur={() => setFocusedInput(null)}
							placeholder="Enter your username"
							autoComplete="username"
							style={{
								...styles.input,
								borderColor: focusedInput === 'username' ? '#10b981' : '#e5e7eb',
								boxShadow: focusedInput === 'username' ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none'
							}}
						/>
					</div>

					{/* Password Input */}
					<div style={styles.inputGroup}>
						<label style={styles.label}>
							<span style={styles.labelIcon}>🔒</span>
							Password
						</label>
						<input
							required
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onFocus={() => setFocusedInput('password')}
							onBlur={() => setFocusedInput(null)}
							placeholder="Enter your password"
							autoComplete="current-password"
							style={{
								...styles.input,
								borderColor: focusedInput === 'password' ? '#10b981' : '#e5e7eb',
								boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none'
							}}
						/>
					</div>

					{/* Site Input */}
					<div style={styles.inputGroup}>
						<label style={styles.label}>
							<span style={styles.labelIcon}>🏢</span>
							Site / Branch
						</label>
						<input
							required
							type="text"
							value={site}
							onChange={(e) => setSite(e.target.value)}
							onFocus={() => setFocusedInput('site')}
							onBlur={() => setFocusedInput(null)}
							placeholder="e.g., Thailand, Republic Korea"
							autoComplete="organization"
							style={{
								...styles.input,
								borderColor: focusedInput === 'site' ? '#10b981' : '#e5e7eb',
								boxShadow: focusedInput === 'site' ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none'
							}}
						/>
					</div>

					{/* Error Message */}
					{error && (
						<div style={styles.error}>
							<span style={styles.errorIcon}>⚠️</span>
							{error}
						</div>
					)}

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading || success}
						style={{
							...styles.button,
							opacity: loading || success ? 0.7 : 1,
							cursor: loading || success ? 'not-allowed' : 'pointer'
						}}
					>
						{loading ? (
							<>
								<span style={styles.spinner}></span>
								Signing in...
							</>
						) : success ? (
							'Success!'
						) : (
							<>
								Sign In
								<span style={styles.buttonArrow}>→</span>
							</>
						)}
					</button>
				</form>

				{/* Features Section */}
				<div style={styles.features}>
					<div style={styles.feature}>
						<span style={styles.featureIcon}>⚡</span>
						<span style={styles.featureText}>7-15% Electricity Savings</span>
					</div>
					<div style={styles.feature}>
						<span style={styles.featureIcon}>✓</span>
						<span style={styles.featureText}>Patented & Certified</span>
					</div>
					<div style={styles.feature}>
						<span style={styles.featureIcon}>🌍</span>
						<span style={styles.featureText}>Trusted in 40+ Countries</span>
					</div>
				</div>

				{/* Footer */}
				<footer style={styles.footer}>
					<div style={styles.footerLinks}>
						<a href="/contact" style={styles.link}>Need Help?</a>
						<span style={styles.footerDot}>•</span>
						<a href="/privacy-policy" style={styles.link}>Privacy Policy</a>
					</div>
					<p style={styles.copyright}>© 2026 K Energy Save Co., Ltd. All rights reserved.</p>
				</footer>
			</main>

			{/* Decorative Elements */}
			<div style={styles.decorLeft}></div>
			<div style={styles.decorRight}></div>
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
		background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
		padding: '20px',
		overflow: 'hidden'
	},
	bgAnimation: {
		position: 'absolute',
		inset: 0,
		overflow: 'hidden',
		pointerEvents: 'none'
	},
	circle1: {
		position: 'absolute',
		width: 400,
		height: 400,
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent)',
		top: '-200px',
		left: '-200px',
		animation: 'pulse 8s ease-in-out infinite'
	},
	circle2: {
		position: 'absolute',
		width: 300,
		height: 300,
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(5, 150, 105, 0.3), transparent)',
		bottom: '-150px',
		right: '-150px',
		animation: 'pulse 10s ease-in-out infinite 2s'
	},
	circle3: {
		position: 'absolute',
		width: 200,
		height: 200,
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(209, 250, 229, 0.2), transparent)',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		animation: 'pulse 6s ease-in-out infinite 4s'
	},
	card: {
		width: '100%',
		maxWidth: 480,
		background: 'rgba(255, 255, 255, 0.98)',
		backdropFilter: 'blur(20px)',
		borderRadius: 24,
		padding: '48px 40px',
		position: 'relative',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 1px rgba(16, 185, 129, 0.3)',
		animation: 'slideUp 0.6s ease-out',
		zIndex: 1
	},
	logoSection: {
		textAlign: 'center',
		marginBottom: 32
	},
	logoCircle: {
		width: 140,
		height: 140,
		borderRadius: '50%',
		background: '#ffffff',
		margin: '0 auto 16px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5), 0 0 0 4px rgba(16, 185, 129, 0.1)',
		animation: 'float 3s ease-in-out infinite',
		padding: 12,
		overflow: 'hidden'
	},
	logoImage: {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		borderRadius: '50%'
	},
	brandName: {
		margin: 0,
		fontSize: 24,
		fontWeight: 800,
		color: '#064e3b',
		letterSpacing: '-0.5px'
	},
	tagline: {
		margin: '8px 0 0 0',
		fontSize: 13,
		color: '#059669',
		fontWeight: 700,
		letterSpacing: '1px',
		textTransform: 'uppercase'
	},
	subTagline: {
		margin: '4px 0 0 0',
		fontSize: 12,
		color: '#10b981',
		fontWeight: 600,
		letterSpacing: '0.5px',
		fontStyle: 'italic'
	},
	divider: {
		width: 60,
		height: 3,
		background: 'linear-gradient(90deg, #10b981, #059669)',
		margin: '20px auto',
		borderRadius: 2
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: 20
	},
	formTitle: {
		margin: '0 0 24px 0',
		fontSize: 28,
		fontWeight: 700,
		color: '#1F1346',
		textAlign: 'center'
	},
	inputGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	label: {
		fontSize: 14,
		fontWeight: 600,
		color: '#065f46',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	labelIcon: {
		fontSize: 16
	},
	input: {
		width: '100%',
		padding: '14px 16px',
		fontSize: 16,
		border: '2px solid #e5e7eb',
		borderRadius: 12,
		outline: 'none',
		transition: 'all 0.3s ease',
		background: '#ffffff',
		color: '#064e3b',
		fontFamily: 'inherit'
	},
	button: {
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
		gap: 8,
		position: 'relative',
		overflow: 'hidden'
	},
	buttonArrow: {
		fontSize: 20,
		transition: 'transform 0.3s ease'
	},
	spinner: {
		width: 18,
		height: 18,
		border: '2px solid rgba(255, 255, 255, 0.3)',
		borderTop: '2px solid #ffffff',
		borderRadius: '50%',
		animation: 'spin 0.8s linear infinite'
	},
	error: {
		padding: '12px 16px',
		background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
		border: '2px solid #fca5a5',
		borderRadius: 12,
		color: '#dc2626',
		fontSize: 14,
		fontWeight: 600,
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	errorIcon: {
		fontSize: 18
	},
	features: {
		marginTop: 24,
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		padding: '20px 0',
		borderTop: '1px solid #e5e7eb'
	},
	feature: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		padding: '8px 0'
	},
	featureIcon: {
		fontSize: 18,
		width: 24,
		textAlign: 'center'
	},
	featureText: {
		fontSize: 13,
		color: '#065f46',
		fontWeight: 600,
		letterSpacing: '0.2px'
	},
	footer: {
		marginTop: 32,
		paddingTop: 24,
		borderTop: '1px solid #e5e7eb',
		textAlign: 'center'
	},
	footerLinks: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		marginBottom: 12
	},
	link: {
		fontSize: 14,
		color: '#10b981',
		textDecoration: 'none',
		fontWeight: 600,
		transition: 'color 0.2s ease'
	},
	footerDot: {
		color: '#d1d5db',
		fontSize: 12
	},
	copyright: {
		margin: 0,
		fontSize: 12,
		color: '#727586'
	},
	successOverlay: {
		position: 'fixed',
		inset: 0,
		background: 'rgba(6, 78, 59, 0.9)',
		backdropFilter: 'blur(8px)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 9999
	},
	successCard: {
		background: 'white',
		borderRadius: 24,
		padding: 48,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 16,
		animation: 'scaleIn 0.5s ease',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
	},
	successText: {
		fontSize: 24,
		fontWeight: 700,
		color: '#10b981'
	},
	successSubtext: {
		fontSize: 14,
		color: '#727586'
	},
	decorLeft: {
		position: 'absolute',
		width: 200,
		height: 200,
		background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.3), transparent)',
		borderRadius: '50%',
		top: 100,
		left: -100,
		filter: 'blur(60px)',
		pointerEvents: 'none'
	},
	decorRight: {
		position: 'absolute',
		width: 300,
		height: 300,
		background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), transparent)',
		borderRadius: '50%',
		bottom: -150,
		right: -150,
		filter: 'blur(80px)',
		pointerEvents: 'none'
	}
}
