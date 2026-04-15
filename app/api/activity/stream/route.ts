import { NextResponse } from 'next/server'
import { fetchActivityFeed, type ActivityFeedItem } from '@/lib/activity-feed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function buildSignature(activity: ActivityFeedItem) {
  return [activity.type, activity.ref_id ?? 'none', activity.ts ?? 'none', activity.title].join('::')
}

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      let knownSignatures = new Set<string>()

      const send = (payload: unknown) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch {
          closed = true
        }
      }

      const syncActivities = async (emitNewOnly: boolean) => {
        try {
          const activities = await fetchActivityFeed(60)
          const currentSignatures = new Set(activities.map(buildSignature))

          if (emitNewOnly) {
            const newActivities = activities
              .filter((activity) => !knownSignatures.has(buildSignature(activity)))
              .sort((a, b) => new Date(a.ts || 0).getTime() - new Date(b.ts || 0).getTime())

            for (const activity of newActivities) {
              send(activity)
            }
          }

          knownSignatures = currentSignatures
        } catch (error) {
          if (!String(error).includes('Too many')) {
            console.error('activity stream sync error', error)
          }
        }
      }

      await syncActivities(false)
      send({ ready: true })

      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval)
          return
        }
        await syncActivities(true)
      }, 10000)

      const pingInterval = setInterval(() => {
        if (closed) {
          clearInterval(pingInterval)
          return
        }
        send({ ping: Date.now() })
      }, 30000)

      setTimeout(() => {
        closed = true
        clearInterval(interval)
        clearInterval(pingInterval)
        try { controller.close() } catch {}
      }, 10 * 60 * 1000)
    }
  })

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  })
}
