'use client'

import { usePathname } from 'next/navigation'
import Loader from './Loader'

/**
 * Site chrome gate. Shows the default loader only on the home page — pitch
 * pages (/for/<slug>) render their own loader with custom copy — and never on
 * the /studio route (so the embedded Sanity editor renders clean).
 */
export default function SiteChrome() {
  const pathname = usePathname() || '/'

  if (pathname.startsWith('/studio')) return null

  return <>{pathname === '/' && <Loader />}</>
}
