import { NextResponse } from 'next/server'

// Simple admin webhook route.
// - GET returns a small info object and echoes query params.
// - POST accepts JSON body and echoes it back.
// Optional protection: set `ADMIN_WEBHOOK_TOKEN` in your environment and
// callers must send the same value in the `x-admin-token` header.

const ADMIN_TOKEN = process.env.ADMIN_WEBHOOK_TOKEN || ''

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

async function verify(req: Request) {
  if (!ADMIN_TOKEN) return true
  const header = req.headers.get('x-admin-token')
  return header === ADMIN_TOKEN
}

export async function GET(req: Request) {
  try {
    if (!(await verify(req))) return unauthorized()

    const url = new URL(req.url)
    const query: Record<string, string> = {}
    url.searchParams.forEach((v, k) => (query[k] = v))

    const info = {
      name: 'admin-main-webhook',
      description: 'Webhook for admin main page actions',
      availableRoutes: ['/admin/AdminKsavelogin','/admin/tokens','/admin/add-machine','/admin/main/report']
    }

    return NextResponse.json({ ok: true, info, query })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!(await verify(req))) return unauthorized()

    let body: any = null
    try {
      body = await req.json()
    } catch (e) {
      // not JSON or empty body
      body = null
    }

    // Basic action handling example: echo back action and payload
    const action = body?.action ?? 'echo'

    return NextResponse.json({ ok: true, action, payload: body })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export const runtime = 'edge'
