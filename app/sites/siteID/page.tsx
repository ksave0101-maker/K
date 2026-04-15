import React from 'react'
import Link from 'next/link'

export default function Page({ params }: { params?: { siteID?: string } }) {
	return (
		<main className="p-4">
			<div className="mb-4">
				<h1 className="text-xl font-semibold">Site</h1>
				<p className="text-sm text-muted-foreground">ID: {params?.siteID ?? '(unknown)'}</p>
			</div>
			<div>
				<Link href="/sites" className="text-sm underline">Back to Sites</Link>
			</div>
		</main>
	)
}
