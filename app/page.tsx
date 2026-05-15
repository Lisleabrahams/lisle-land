import { client } from '@/lib/sanity'
import Portfolio from '@/components/Portfolio'

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
      videoDisplayType,
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
