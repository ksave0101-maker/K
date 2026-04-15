import React from "react";

// Minimal page component to ensure this route file is a valid module.
// Kept intentionally small — replace with the real UI when available.
export default function Page({ params }: { params?: { siteID?: string; machine?: string; KsaveID?: string } }) {
	return (
		<div className="p-4">
			<h1 className="text-lg font-semibold">Ksave</h1>
			<p className="text-sm text-muted-foreground">ID: {params?.KsaveID ?? "(unknown)"}</p>
		</div>
	);
}
