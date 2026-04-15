import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware for K-System
// The root page (/) now displays LoginMain by default
// This middleware can be used for additional domain-specific routing if needed

export function middleware(req: NextRequest) {
	// Add any custom middleware logic here if needed
	return NextResponse.next()
}

// Limit middleware to only run on the site root to keep it lightweight
export const config = {
	matcher: '/',
}
