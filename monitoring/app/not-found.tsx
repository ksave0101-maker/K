import Link from 'next/link'

export default function NotFound() {
	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '100vh',
			textAlign: 'center',
			padding: '20px'
		}}>
			<h1 style={{ fontSize: '72px', margin: 0 }}>404</h1>
			<h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Page Not Found</h2>
			<p style={{ marginBottom: '30px', color: '#666' }}>
				The page you are looking for does not exist.
			</p>
			<Link 
				href="/" 
				style={{
					padding: '12px 24px',
					background: '#3b82f6',
					color: 'white',
					textDecoration: 'none',
					borderRadius: '8px'
				}}
			>
				Go Home
			</Link>
		</div>
	)
}
