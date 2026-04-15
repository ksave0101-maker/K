import React from "react"
import './styles/globals.css'
import Script from 'next/script'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: "K Energy Save - ENERGY YOU CAN TRUST",
	description: "Advanced power-saving technology with proven results. Cut your Electric Bill from day one!",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// Read Accept-Language on the server to render a matching `lang` attribute
	const headersList = await headers()
	const acceptLang = headersList.get('accept-language') || 'en'
	const lang = acceptLang.split(',')[0].split('-')[0] || 'en'

	return (
		<html lang={lang}>
			<head>
				{/* Run before React hydration to remove classes that browser extensions (eg. Google Translate)
					may inject and which would otherwise cause attribute mismatch warnings. */}
				<Script
					id="fix-translated-class"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{ __html: "(function(){try{document.documentElement.classList.remove('translated-ltr');}catch(e){} })()" }}
				/>
			</head>
			<body suppressHydrationWarning>
				{children}
			</body>
		</html>
	)
}
