'use client'

import { useEffect, useRef, useState } from 'react'
import { boldNames } from './boldText'

// Match Portfolio.js intro paragraph exactly.
const FONT_STACK = '"Geist Mono", monospace'
const FONT_SIZE = 12
const LINE_HEIGHT = 16
const FONT_WEIGHT = 300
const TEXT_COLOR = '#1a1a1a'
const BG_COLOR = '#fff'

const DEFAULT_LABEL = 'Lisle Abrahams Creative Selection'

// Animation timing.
const PHASE_1_MS = 2000   // 0 → 95
const PHASE_2_MS = 200    // 95 → 100
const FADE_MS = 300       // opacity fade-out
const HIDE_DELAY_MS = 60  // brief beat at 100% before fade
const MAX_HOLD_MS = 5000  // safety: don't hold at 95 forever if `load` never fires
const HORIZONTAL_PADDING = 24 // breathing room on narrow viewports

export default function Loader(props) {
  const LABEL = (props && props.label) || DEFAULT_LABEL
  // Name to bold inside the loader text — your name on the site, the client
  // name on pitch pages.
  const boldName = (props && props.boldName) || 'Lisle Abrahams'
  // Server renders [0%]; client takes over after hydration.
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [unmounted, setUnmounted] = useState(false)
  const [scale, setScale] = useState(1)

  const containerRef = useRef(null)
  const measureRef = useRef(null)

  // Progress driver — single RAF loop with phase state machine.
  useEffect(() => {
    let cancelled = false
    let raf = 0
    let hideTimeout = 0
    let unmountTimeout = 0
    let safetyTimeout = 0

    let ready = false
    const markReady = () => { ready = true }

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      markReady()
    } else {
      window.addEventListener('load', markReady)
    }

    const startTime = performance.now()
    let phase = 1
    let phase2Start = 0
    let phase2StartVal = 95
    let progressVal = 0

    const tick = (now) => {
      if (cancelled) return

      if (phase === 1) {
        const t = Math.min((now - startTime) / PHASE_1_MS, 1)
        // Ease-out quad — climbs quickly, settles into 95.
        const eased = 1 - Math.pow(1 - t, 2)
        progressVal = Math.floor(eased * 95)
        setProgress(progressVal)

        if (t >= 1) {
          progressVal = 95
          setProgress(95)
          if (ready) {
            phase = 2
            phase2Start = now
            phase2StartVal = 95
          } else {
            phase = 'hold'
            // Safety net: if `load` event never fires, release after MAX_HOLD_MS.
            safetyTimeout = setTimeout(() => { ready = true }, MAX_HOLD_MS)
          }
        }
        raf = requestAnimationFrame(tick)
        return
      }

      if (phase === 'hold') {
        if (ready) {
          phase = 2
          phase2Start = now
          phase2StartVal = progressVal
        }
        raf = requestAnimationFrame(tick)
        return
      }

      if (phase === 2) {
        const t = Math.min((now - phase2Start) / PHASE_2_MS, 1)
        progressVal = Math.floor(phase2StartVal + (100 - phase2StartVal) * t)
        setProgress(progressVal)
        if (t >= 1) {
          setProgress(100)
          hideTimeout = setTimeout(() => {
            if (!cancelled) setHidden(true)
          }, HIDE_DELAY_MS)
          unmountTimeout = setTimeout(() => {
            if (!cancelled) setUnmounted(true)
          }, HIDE_DELAY_MS + FADE_MS)
          return
        }
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      clearTimeout(hideTimeout)
      clearTimeout(unmountTimeout)
      clearTimeout(safetyTimeout)
      window.removeEventListener('load', markReady)
    }
  }, [])

  // Auto-fit: scale visible text down on narrow viewports so it never wraps.
  // Measure against the widest possible string ("[100%]") so the scale doesn't
  // flicker as the digit count grows.
  useEffect(() => {
    if (!measureRef.current || !containerRef.current) return

    const measure = () => {
      if (!measureRef.current || !containerRef.current) return
      const naturalWidth = measureRef.current.offsetWidth
      const available = containerRef.current.offsetWidth - HORIZONTAL_PADDING
      if (naturalWidth === 0) return
      const next = naturalWidth > available ? available / naturalWidth : 1
      setScale(next)
    }

    measure()
    window.addEventListener('resize', measure)
    // Also re-measure once webfont swaps in (Geist Mono via next/font).
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {})
    }
    return () => window.removeEventListener('resize', measure)
  }, [])

  if (unmounted) return null

  const sharedTextStyle = {
    fontFamily: FONT_STACK,
    // Match the page type: fluid, ~10px on laptops up to 18px on big screens.
    fontSize: 'clamp(10px, 0.72vw, 18px)',
    lineHeight: 1.1,
    fontWeight: FONT_WEIGHT,
    whiteSpace: 'nowrap',
  }

  return (
    <div
      ref={containerRef}
      aria-hidden={hidden ? 'true' : 'false'}
      role="status"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: BG_COLOR,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: hidden ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {/* Invisible measurer — widest possible string at natural size. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          ...sharedTextStyle,
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          top: 0,
          left: 0,
        }}
      >
        {boldNames(`${LABEL} [100%]`, [boldName])}
      </span>

      {/* Visible text — scales to fit single line. */}
      <span
        style={{
          ...sharedTextStyle,
          color: TEXT_COLOR,
          display: 'inline-block',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {boldNames(`${LABEL} [${progress}%]`, [boldName])}
      </span>
    </div>
  )
}
