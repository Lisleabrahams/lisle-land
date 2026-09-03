'use client'

import { useEffect, useRef, useState } from 'react'

// CharacterLoader — video loader + docked landing treatment.
// Figma: file 8yjmXSiJRIYqeF0du6t3dx, frames 2301:3655 (loader), 2301:3659
// (docked desktop), 2301:3665 (mobile loader), 2301:3666 (mobile after — no dock).
//
// Sequence:
//   hero    — white takeover, character video plays big left (desktop) /
//             low-center (mobile), title in Geist Mono to the right / above.
//   dock    — desktop: video slides to the right edge, blurs to 34px, slows to
//             a crawl; white + title fade out revealing the page. The blurred
//             sliver stays fixed over the page (pointer-events: none).
//           — mobile: everything just fades out (per 02_mobile — no dock).
//
// All geometry below is transcribed from the Figma frames as viewport
// fractions (desktop frame 1449×1067, mobile frame 402.8×873).

const MOBILE_BREAKPOINT = 768

// Timing
const HOLD_MS = 2800          // hero hold before docking (first visit)
const HOLD_SEEN_MS = 900      // repeat visitors: shorter hero, same choreography
const DOCK_MS = 1400          // slide + blur ramp duration
const TITLE_FADE_MS = 450
const MOBILE_FADE_MS = 550
const DOCKED_RATE = 0.15      // "veeeeeery slowly"

// Desktop geometry (fractions of 1449×1067 frame)
const D = {
  boxLeftHero: '0vw',
  boxLeftDocked: '74.8vw',    // 1083.84 / 1449
  boxTop: '-1.06vh',          // -11.33 / 1067
  boxWidth: '64.97vw',        // 941.492 / 1449
  boxHeight: '101.15vh',      // 1079.227 / 1067
  blurDocked: 34,             // 33.9px in Figma
  titleLeft: '75.71vw',       // 1096.96 / 1449 (center point)
  titleTop: '54.01vh',        // 576.3 / 1067
}

// Mobile geometry (fractions of 402.834×873 frame)
const M = {
  boxLeft: '-6.82vw',         // -27.48 / 402.834
  boxTop: '19.08vh',          // 166.59 / 873
  boxWidth: '159.02vw',       // 640.604 / 402.834
  boxHeight: '84.11vh',       // 734.321 / 873
  titleTop: '18.59vh',        // 162.3 / 873
}

export default function CharacterLoader({
  webmSrc,
  hevcSrc,
  title = 'EA Battlefield X Lisle Abrahams',
}) {
  // phase: 'hero' → 'docking' → 'docked' (desktop) | 'fading' → 'gone' (mobile)
  const [phase, setPhase] = useState('hero')
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Pick the codec the browser can actually composite with alpha:
  // Safari → HEVC-alpha .mov, everyone else → VP9 .webm.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const canWebm = v.canPlayType('video/webm; codecs="vp9"')
    const src = canWebm ? webmSrc : (hevcSrc || webmSrc)
    if (src && v.src !== src) {
      v.src = src
      const p = v.play()
      if (p && p.catch) p.catch(() => {})
    }
  }, [webmSrc, hevcSrc])

  // Choreography clock.
  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem('lisle_intro_seen') === '1' } catch (e) {}
    let reduced = false
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) {}

    const hold = reduced ? 0 : (seen ? HOLD_SEEN_MS : HOLD_MS)
    const mobile = window.innerWidth < MOBILE_BREAKPOINT

    // Lock scroll during the hero moment.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const release = () => { document.body.style.overflow = prevOverflow }

    const t1 = setTimeout(() => {
      release()
      if (mobile) {
        setPhase('fading')
      } else {
        setPhase('docking')
        const v = videoRef.current
        if (v) v.playbackRate = DOCKED_RATE
      }
    }, hold)

    const settleMs = hold + (mobile ? MOBILE_FADE_MS : DOCK_MS)
    const t2 = setTimeout(() => {
      setPhase(mobile ? 'gone' : 'docked')
      try { localStorage.setItem('lisle_intro_seen', '1') } catch (e) {}
    }, settleMs)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      release()
    }
  }, [])

  if (phase === 'gone') return null

  const hero = phase === 'hero'
  const overlayInteractive = hero || phase === 'fading'
  const fadingOut = phase === 'fading'

  const ease = 'cubic-bezier(0.65, 0, 0.35, 1)'

  // Video box: Figma placement per breakpoint. Before hydration (mounted
  // false) render the desktop hero so SSR shows a sane first paint; the
  // white overlay covers any pre-hydration shuffle anyway.
  const mob = mounted && isMobile
  const boxStyle = mob
    ? {
        position: 'absolute',
        left: M.boxLeft,
        top: M.boxTop,
        width: M.boxWidth,
        height: M.boxHeight,
      }
    : {
        position: 'absolute',
        left: hero ? D.boxLeftHero : D.boxLeftDocked,
        top: D.boxTop,
        width: D.boxWidth,
        height: D.boxHeight,
        filter: hero ? 'blur(0px)' : `blur(${D.blurDocked}px)`,
        transition: `left ${DOCK_MS}ms ${ease}, filter ${DOCK_MS}ms ${ease}`,
      }

  return (
    <div
      aria-hidden={hero ? 'false' : 'true'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: overlayInteractive ? 99998 : 500,
        pointerEvents: overlayInteractive ? 'auto' : 'none',
        overflow: 'hidden',
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? `opacity ${MOBILE_FADE_MS}ms ease-out` : undefined,
      }}
    >
      {/* White takeover — fades away as the dock begins. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#fff',
          opacity: hero || fadingOut ? 1 : 0,
          transition: `opacity ${DOCK_MS}ms ${ease}`,
        }}
      />

      {/* Character video */}
      <div style={boxStyle}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '60% 50%',
            display: 'block',
          }}
        />
      </div>

      {/* Title — Geist Mono 12px, capitalize, -0.6px tracking (Figma 2301:3658) */}
      <p
        style={{
          position: 'absolute',
          left: mob ? '50vw' : D.titleLeft,
          top: mob ? M.titleTop : D.titleTop,
          transform: 'translateX(-50%)',
          width: mob ? 'min(332.977px, 88vw)' : '332.977px',
          margin: 0,
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.6px',
          textTransform: 'capitalize',
          textAlign: 'center',
          color: '#000',
          wordBreak: 'break-word',
          opacity: hero || fadingOut ? 1 : 0,
          transition: `opacity ${TITLE_FADE_MS}ms ease-out`,
        }}
      >
        {title}
      </p>
    </div>
  )
}
