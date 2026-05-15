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
  
  console.log('=== FETCHED FROM SANITY ===')
  console.log('Projects:', projects?.map((p: any) => ({ title: p.title, description: p.description })))
  
  return { homepage, projects }
}

async function getDuckModel() {
  const duck = await client.fetch(`
    *[_type == "duck"][0] {
      _id,
      title,
      "modelUrl": glbModel.asset->url
    }
  `)
  console.log('Duck model data:', duck)
  
  // Proxy through our API to avoid CORS issues
  if (duck?.modelUrl) {
    duck.modelUrl = `/api/proxy-model?url=${encodeURIComponent(duck.modelUrl)}`
  }
  
  return duck
}

export default async function Home() {
  const { homepage, projects } = await getData()
  const duckModel = await getDuckModel()

  return (
    <Portfolio 
      introText={homepage?.introText} 
      projects={projects}
      duckModelUrl={duckModel?.modelUrl}
    />
  )
}