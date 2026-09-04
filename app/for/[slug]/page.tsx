import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Portfolio from '@/components/Portfolio'
import CharacterLoader from '@/components/CharacterLoader'

// Every application page gets the character-video loader. The title comes
// from the pitch's Loader copy field in Sanity (falling back to
// "<Client> X Lisle Abrahams"), so new applications need no code changes.
const LOADER_ASSETS = {
  webm: '/loader/character-alpha.webm',
  hevc: '/loader/character-alpha.mov',
  mp4: '/loader/character-white-boomerang.mp4',
}
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
  const title = meta?.clientName
    ? `Lisle Abrahams — for ${meta.clientName}`
    : 'Lisle Abrahams'
  const description = meta?.clientName
    ? `Portfolio and CV, put together for ${meta.clientName}.`
    : 'World-class creative director with 10+ years of agency craft, now operating as an AI-augmented studio of one.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://lisle.land/for/${slug}`,
      siteName: 'lisle.land',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
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
      <CharacterLoader
        webmSrc={LOADER_ASSETS.webm}
        hevcSrc={LOADER_ASSETS.hevc}
        mp4Src={LOADER_ASSETS.mp4}
        title={pitch.loaderCopy || `${pitch.clientName} X Lisle Abrahams`}
      />
      <Portfolio introText={pitch.introText || undefined} projects={projects} clientName={pitch.clientName} isPitch />
    </>
  )
}
