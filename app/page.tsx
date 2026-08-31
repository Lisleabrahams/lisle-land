import { client } from '@/lib/sanity'
import Portfolio from '@/components/Portfolio'

// Refetch Sanity content at most every 60s, so publishes show up
// on the live site without needing a redeploy.
export const revalidate = 60

async function getData() {
  const homepage = await client.fetch(`*[_type == "homepage"][0]`)
  const projects = await client.fetch(`*[_type == "project"] | order(order asc) {
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
      "backgroundImageUrl": backgroundImage.asset->url,
      "backgroundImageMobileUrl": backgroundImageMobile.asset->url,
      "backgroundVideoUrl": backgroundVideo.asset->url,
      "backgroundVideoMobileUrl": backgroundVideoMobile.asset->url,
      "foregroundImageUrl": foregroundImage.asset->url,
      "foregroundImageMobileUrl": foregroundImageMobile.asset->url,
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
  }`)

  return { homepage, projects }
}

export default async function Home() {
  const { homepage, projects } = await getData()

  return (
    <Portfolio
      introText={homepage?.introText}
      projects={projects}
    />
  )
}
