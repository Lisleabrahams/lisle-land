import { client } from '@/lib/sanity'
import WebGLBlur from '@/components/WebGLBlur'

// Live page running the actual JorgeCapillo/webgl-progressive-blur OGL scene
// over your real project images, so the shader is visibly doing its thing.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'lisle.land — blur',
  robots: { index: false, follow: false },
}

async function getImages(): Promise<string[]> {
  const data: Array<{ media?: Array<{ url?: string }> }> = await client.fetch(
    `*[_type=="project"] | order(order asc){
      media[]{
        "url": coalesce(
          image.asset->url,
          asset->url,
          backgroundImage.asset->url,
          foregroundImage.asset->url,
          leftImage.asset->url,
          rightImage.asset->url
        )
      }
    }`,
  )
  const urls: string[] = []
  for (const p of data || []) {
    for (const m of p.media || []) {
      if (m?.url && /\.(jpg|jpeg|png|webp)/i.test(m.url)) urls.push(m.url)
    }
  }
  return urls.slice(0, 16)
}

export default async function BlurPage() {
  const images = await getImages()
  return (
    <>
      {/* dark backdrop sits behind the canvas (z-index 0) */}
      <div
        aria-hidden
        style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: -1 }}
      />
      <WebGLBlur />
      <main style={{ margin: 0, position: 'static' }}>
        {images.map((url, i) => (
          <div className="media-container" key={i}>
            <figure className="media">
              <img
                src={`${url}?w=1400&auto=format&fit=max`}
                crossOrigin="anonymous"
                alt=""
              />
            </figure>
          </div>
        ))}
      </main>
    </>
  )
}
