import 'server-only'
import { createClient } from '@sanity/client'

// Fresh (non-CDN) read client — pitch pages are private/targeted and must
// never serve a stale cached version.
const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lmmr04bx',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Exact same media projection the home page (app/page.tsx) uses, so pitch
// projects resolve to an identical shape and render through <Portfolio/>
// unchanged.
const PROJECT_PROJECTION = `{
  _id,
  title,
  slug,
  order,
  description,
  media[] {
    ...,
    _type,
    description,
    "imageUrl": image.asset->url,
    "mobileImageUrl": mobileImage.asset->url,
    "mobileVideoUrl": mobileVideo.asset->url,
    "backgroundImageUrl": backgroundImage.asset->url,
    "backgroundImageMobileUrl": backgroundImageMobile.asset->url,
    "backgroundVideoUrl": backgroundVideo.asset->url,
    "backgroundVideoMobileUrl": backgroundVideoMobile.asset->url,
    "foregroundImageUrl": foregroundImage.asset->url,
    "foregroundImageMobileUrl": foregroundImageMobile.asset->url,
    "foregroundVideoUrl": foregroundVideo.asset->url,
    "foregroundVideoMobileUrl": foregroundVideoMobile.asset->url,
    intensity,
    "leftImageUrl": leftImage.asset->url,
    "rightImageUrl": rightImage.asset->url,
    fullBleedSide,
    parallaxIntensity,
    mobileLayout,
    framedImageSize,
    asset-> {
      _id,
      url,
      mimeType
    },
    alt,
    title,
    desktopWidth,
    mobileFullHeight,
    size,
    colorHex,
    quickPresets
  },
  descriptions[]
}`

const PITCH_QUERY = `*[_type == "pitchPage" && slug.current == $slug && published == true][0]{
  _id,
  clientName,
  "slug": slug.current,
  loaderCopy,
  introText,
  expiresAt,
  "views": coalesce(views, 0),
  "selectedProjects": selectedProjects[]->${PROJECT_PROJECTION}
}`

const ALL_PROJECTS_QUERY = `*[_type == "project"] | order(order asc) ${PROJECT_PROJECTION}`

/**
 * Resolve a published pitch by slug. Returns null when missing/unpublished.
 * Falls back to the full project list when no projects are explicitly
 * selected, so a pitch with only copy overrides still shows the portfolio.
 */
export async function getPitchPage(slug) {
  const pitch = await readClient.fetch(PITCH_QUERY, { slug })
  if (!pitch) return null

  let projects = pitch.selectedProjects
  if (!projects || projects.length === 0) {
    projects = await readClient.fetch(ALL_PROJECTS_QUERY)
  }

  return { pitch, projects }
}

// Lightweight lookup for generateMetadata — avoids resolving every project.
export async function getPitchMeta(slug) {
  return readClient.fetch(
    `*[_type == "pitchPage" && slug.current == $slug && published == true][0]{ clientName }`,
    { slug },
  )
}
