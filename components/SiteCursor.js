'use client'

import { usePathname } from 'next/navigation'

/**
 * Oversized stylised cursor, Figma-style: ~150% scale arrow, black with a
 * white outline (inverted on interactive elements) so it reads on every
 * background colour. Text fields keep the normal I-beam. Skipped in /studio.
 */
const ARROW = `url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'34'%20height%3D'34'%20viewBox%3D'0%200%2034%2034'%3E%3Cpath%20d%3D'M9%203%20L9%2027.5%20L15%2021.6%20L18.7%2030%20L23%2028.1%20L19.2%2019.9%20L27.5%2019.2%20Z'%20fill%3D'black'%20stroke%3D'white'%20stroke-width%3D'2'%20stroke-linejoin%3D'round'%2F%3E%3C%2Fsvg%3E") 9 3`
const ARROW_HOVER = `url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'34'%20height%3D'34'%20viewBox%3D'0%200%2034%2034'%3E%3Cpath%20d%3D'M9%203%20L9%2027.5%20L15%2021.6%20L18.7%2030%20L23%2028.1%20L19.2%2019.9%20L27.5%2019.2%20Z'%20fill%3D'white'%20stroke%3D'black'%20stroke-width%3D'2'%20stroke-linejoin%3D'round'%2F%3E%3C%2Fsvg%3E") 9 3`

export default function SiteCursor() {
  const pathname = usePathname()
  if (pathname?.startsWith('/studio')) return null
  return (
    <style>{`
      *, *::before, *::after { cursor: ${ARROW}, auto; }
      a, a *, button, button *, [role="button"], summary, select, video { cursor: ${ARROW_HOVER}, pointer; }
      input, textarea, [contenteditable="true"] { cursor: text; }
    `}</style>
  )
}
