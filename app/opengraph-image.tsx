import { ImageResponse } from 'next/og'

// Next.js auto-detects this file and exposes it as the OG image for the route.
// Also doubles as the Twitter card image when no twitter-image is defined.

export const runtime = 'edge'
export const alt =
  'Lisle Abrahams — World-class creative director, AI-augmented studio of one.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Pull Geist Mono off Google Fonts so the card uses the same typeface as the site.
async function loadGeistMono(weight: 300 | 400) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Geist+Mono:wght@${weight}`
  const css = await fetch(cssUrl, {
    headers: {
      // Google Fonts serves woff2 only to modern UAs.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    },
  }).then((r) => r.text())

  const match = css.match(/src: url\((.+?)\) format/)
  if (!match) throw new Error('Geist Mono woff2 URL not found in Google Fonts CSS')
  const fontData = await fetch(match[1]).then((r) => r.arrayBuffer())
  return fontData
}

export default async function Image() {
  let fontData: ArrayBuffer | null = null
  try {
    fontData = await loadGeistMono(300)
  } catch {
    // Network blip — fall through to default monospace.
  }

  const fonts = fontData
    ? [
        {
          name: 'Geist Mono',
          data: fontData,
          weight: 300 as const,
          style: 'normal' as const,
        },
      ]
    : undefined

  const fontFamily = fontData ? 'Geist Mono' : 'monospace'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily,
          fontWeight: 300,
          padding: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header label — mirrors the loader so the card feels of-a-piece. */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#999',
          }}
        >
          Lisle Abrahams Creative Selection
        </div>

        {/* Body — same words as the homepage intro paragraph. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
            }}
          >
            Lisle Abrahams
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              maxWidth: 980,
            }}
          >
            World-class creative director with 15+ years of agency craft, now
            operating as an AI-augmented studio of one.
          </div>
        </div>

        {/* Footer — domain. */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#999',
          }}
        >
          lisle.land
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
