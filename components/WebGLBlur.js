'use client'

import { useEffect } from 'react'

/**
 * Boots the actual JorgeCapillo/webgl-progressive-blur OGL scene (GL.js) on
 * this page. Renders the repo's #gl canvas; once the .media images exist it
 * instantiates GL and drives it from window scroll (the repo used Lenis; native
 * scroll feeds the same GL.onScroll). ogl + GL are dynamically imported so they
 * only ever run in the browser.
 */
export default function WebGLBlur() {
  useEffect(() => {
    let gl = null
    let onScroll = null
    let cancelled = false

    async function boot() {
      const start = performance.now()
      const hasMedia = () => document.querySelectorAll('.media img').length > 0
      // Wait for the images (and their layout) to be present.
      while (!hasMedia() && performance.now() - start < 20000) {
        await new Promise((r) => setTimeout(r, 120))
        if (cancelled) return
      }
      if (cancelled || !hasMedia()) return

      const { default: GL } = await import('./webgl-blur/GL')
      gl = new GL()
      onScroll = () => gl.onScroll({ scroll: window.scrollY })
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }

    boot()

    return () => {
      cancelled = true
      if (onScroll) window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return <canvas id="gl" />
}
