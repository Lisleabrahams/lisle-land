'use client'

import { usePathname } from 'next/navigation'
import Loader from './Loader'
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
      {pathname === '/' && <Loader />}
      <ProgressiveBlurEdges />
    </>
  )
}
