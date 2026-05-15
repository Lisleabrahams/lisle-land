import { ImageResponse } from 'next/og'

// Next.js auto-detects this file and exposes it as the OG image for the route.
// Also doubles as the Twitter card image when no twitter-image is defined.

export const alt =
  'Lisle Abrahams — World-class creative director, AI-augmented studio of one.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
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
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              lineHeight: 1.05,
              marginBottom: 28,
            }}
          >
            Lisle Abrahams
          </div>
          <div
            style={{
              display: 'flex',
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
    { ...size },
  )
}
