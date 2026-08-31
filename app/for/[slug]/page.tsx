import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Portfolio from '@/components/Portfolio'
import Loader from '@/components/Loader'
import PitchExpired from './PitchExpired'
import { getPitchPage, getPitchMeta } from '@/lib/pitch'
import { trackPitchView } from '@/lib/pitch-tracking'

// Pitches are private, targeted links — always render fresh, never indexed.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = await getPitchMeta(slug)
  return {
    title: meta?.clientName ? `Lisle Abrahams — for ${meta.clientName}` : 'Lisle Abrahams',
    robots: { index: false, follow: false },
  }
}

export default async function PitchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPitchPage(slug)
  if (!data) notFound()

  const { pitch, projects } = data

  // Expiry takes precedence over tracking — expired views don't count and
  // never fire the first-view Slack ping.
  if (new Date(pitch.expiresAt) < new Date()) {
    return <PitchExpired clientName={pitch.clientName} />
  }

  // Pass the pre-increment view count so previousViews === 0 fires the Slack
  // ping exactly once. Awaited so the serverless function doesn't tear down
  // mid-flight.
  await trackPitchView({
    pitchId: pitch._id,
    previousViews: pitch.views,
    clientName: pitch.clientName,
    slug: pitch.slug,
  })

  return (
    <>
      <Loader label={pitch.loaderCopy || undefined} boldName={pitch.clientName} />
      <Portfolio introText={pitch.introText || undefined} projects={projects} clientName={pitch.clientName} isPitch />
    </>
  )
}
