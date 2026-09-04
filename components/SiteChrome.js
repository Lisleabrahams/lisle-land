'use client'

import { usePathname } from 'next/navigation'
import CharacterLoader from './CharacterLoader'
import ProgressiveBlurEdges from './ProgressiveBlurEdges'

/**
 * Site chrome gate. Shows the default loader only on the home page, the
 * top/bottom edge blur on every page, and nothing on /studio (so the embedded
 * Sanity editor renders clean).
 */
export default function SiteChrome() {
  const pathname = usePathname() || '/'

  if (pathname.startsWith('/studio')) return null

  return (
    <>
      {pathname === '/' && (
        <CharacterLoader
          webmSrc="/loader/character-alpha.webm"
          hevcSrc="/loader/character-alpha.mov"
          mp4Src="/loader/character-white-boomerang.mp4"
          title="Lisle Abrahams Creative Selection"
        />
      )}
      <ProgressiveBlurEdges />
      {/* Thin inset frame — above the blur, blends like the type so it stays
          crisp and visible over any content. */}
      <div
        aria-hidden="true"
        className="max-md:hidden"
        style={{
          position: 'fixed',
          top: 23,
          left: 23,
          right: 23,
          bottom: 23,
          border: '0.5px solid #fff',
          mixBlendMode: 'difference',
          zIndex: 10001,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
