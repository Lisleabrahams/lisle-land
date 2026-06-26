import StudioClient from './StudioClient'

export const dynamic = 'force-static'

// Full-bleed studio viewport (defined inline rather than re-exported from
// next-sanity, to avoid coupling to that package's export surface).
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata = {
  title: 'lisle.land — Studio',
  robots: {index: false, follow: false},
}

export default function StudioPage() {
  return <StudioClient />
}
