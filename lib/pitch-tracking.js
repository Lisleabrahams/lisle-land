import 'server-only'
import { writeClient } from './sanity.write'

// Prospects always see the live URL in Slack, even when the ping fires from a
// preview deploy or localhost.
const SITE_HOST = 'https://lisle.land'

async function incrementViews(pitchId) {
  await writeClient.patch(pitchId).inc({ views: 1 }).commit()
}

async function postSlackFirstViewPing({ clientName, slug }) {
  const token = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_CHANNEL_ID
  if (!token || !channel) {
    // No Slack creds in this environment — silently no-op; views still count.
    return
  }
  const text = `📩 New pitch view — *${clientName}* just opened their pitch page. ${SITE_HOST}/for/${slug}`
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ channel, text, unfurl_links: false, unfurl_media: false }),
  })
  // chat.postMessage returns HTTP 200 even on logical failure — check `ok`.
  const payload = await res.json().catch(() => ({}))
  if (!res.ok || !payload.ok) {
    console.error('[pitch-tracking] Slack ping failed', {
      httpStatus: res.status,
      slackError: payload.error,
    })
  }
}

/**
 * Fire-and-forget tracking. Increments the view counter and, on the FIRST
 * view only (previousViews === 0), posts the Slack ping. Never throws — a
 * tracking failure must not break the page render. Awaited so the serverless
 * function isn't torn down with the calls in flight.
 */
export async function trackPitchView({ pitchId, previousViews, clientName, slug }) {
  const tasks = [
    incrementViews(pitchId).catch((err) => {
      console.error('[pitch-tracking] increment views failed', err)
    }),
  ]
  if (previousViews === 0) {
    tasks.push(
      postSlackFirstViewPing({ clientName, slug }).catch((err) => {
        console.error('[pitch-tracking] Slack ping threw', err)
      }),
    )
  }
  await Promise.allSettled(tasks)
}
