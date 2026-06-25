'use client'

import { usePathname } from 'next/navigation'
import Loader from './Loader'
import ProgressiveBlurEdges from './ProgressiveBlurEdges'

/**
 * Site chrome gate. Keeps the loader and the progressive-blur edges OFF the
 * /studio route (so the embedded Sanity editor renders clean), and shows the
 * default loader only on the home page — pitch pages (/for/<slug>) render
 * their own loader with custom copy.
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
