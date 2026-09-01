'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Site-wide media protection: blocks the right-click context menu, drag-to-
 * desktop and iOS long-press save on images and videos. A deterrent for
 * casual saving, not DRM. Skipped entirely inside /studio so editing is
 * unaffected.
 */
export default function MediaProtection() {
  const pathname = usePathname()
  const active = !pathname?.startsWith('/studio')

  useEffect(() => {
    if (!active) return

    const onContextMenu = (e) => {
      if (e.target.closest && e.target.closest('img, video')) e.preventDefault()
    }
    const onDragStart = (e) => {
      if (e.target.closest && e.target.closest('img')) e.preventDefault()
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('dragstart', onDragStart)
    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('dragstart', onDragStart)
    }
  }, [active])

  if (!active) return null
  return (
    <style>{`
      img, video {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-user-drag: none;
      }
    `}</style>
  )
}
