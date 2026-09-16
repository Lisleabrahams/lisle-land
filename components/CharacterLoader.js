'use client'

import { useEffect, useRef, useState } from 'react'

// CharacterLoader — video loader + docked landing treatment.
// Figma: file 8yjmXSiJRIYqeF0du6t3dx, frames 2301:3655 (loader), 2301:3659
// (docked desktop), 2301:3665 (mobile loader), 2301:3666 (mobile after — no dock).
//
// Sequence:
//   hero    — white takeover, character video plays big left (desktop) /
//             low-center (mobile), title in Geist Mono to the right / above.
//             Holds until the animation has played ONCE in full (video
//             'ended' + a small beat; safety timeout if playback never runs).
//   dock    — desktop: one continuous slide to the right with the blur
//             ramping in and the white curtain fading underneath; the video
//             blends (multiply) so it never shows a white box over content,
//             and only tucks behind the content once fully parked. Hovering
//             the docked sliver gently pulls it into full sharpness.
//           — mobile: everything fades out after the play-through (02_mobile).
//
// Geometry transcribed from the Figma frames as viewport fractions
// (desktop frame 1449×1067, mobile frame 402.8×873).

const MOBILE_BREAKPOINT = 768

// Timing
const POST_END_BEAT_MS = 350  // beat after the animation finishes, before docking
const SAFETY_DOCK_MS = 6500   // dock anyway if video playback never completes
const DOCK_MS = 1400          // slide + blur ramp duration
const TITLE_FADE_MS = 450
const MOBILE_FADE_MS = 550
const HOVER_SHARPEN_MS = 600  // docked hover: gentle snap to full sharpness
const DOCKED_RATE = 0.85      // near-full speed once docked

// Desktop geometry. The video renders at its FULL natural 16:9 frame at
// full height (179.82vh wide) — nothing is ever cropped, no cut can exist.
// The file's background is pure white, so its edges are invisible against
// the page on every screen. Positioned so the character sits exactly where
// the approved external-screen layout had him (face ~11vh from the left).
const D = {
  boxLeftHero: '-47.6vh',                    // full frame shifted so the face margin is ~11vh
  boxLeftDocked: 'calc(74.8vw - 47.6vh)',    // same slide distance as before
  boxTop: '-1.06vh',          // -11.33 / 1067
  boxWidth: '179.82vh',       // natural 16:9 width at full height — zero crop
  boxHeight: '101.15vh',      // 1079.227 / 1067
  blurDocked: 34,             // 33.9px in Figma
  titleLeft: '75.71vw',       // 1096.96 / 1449 (center point)
  titleTop: '54.01vh',        // 576.3 / 1067
}

// Mobile geometry. Same no-crop law as desktop: the video renders its full
// natural 16:9 frame spanning past the viewport top and bottom (the file's
// own edges slice the character, so they must always sit off-screen).
// Character face-centred; width = 102vh * 16/9, left centres the character
// (his centre sits at 60.3% of the frame).
const M = {
  // Full-bleed height with the file's top edge OFF-SCREEN — the video file
  // has zero headroom (the antennas stop dead at its own top edge, verified
  // frame by frame), so any on-screen top edge shows them flat-cut. That
  // ruled out the 14 Sep "shrink + move down" placement (Lisle flagged the
  // cut on 16 Sep). This is the smallest the video can render cleanly;
  // a visibly smaller character needs a re-rendered file with headroom.
  // Kept the rightward shift: character centred at 58vw (0.603 * width).
  boxLeft: 'calc(58vw - 109.4vh)',
  boxTop: '-1vh',
  boxWidth: '181.4vh',             // natural 16:9 at 102vh height
  boxHeight: '102vh',
  titleTop: '18.59vh',             // 162.3 / 873 (Figma 01_mobile)
}

// Mobile autoplay-blocked fallback (iOS Low Power Mode): the OS refuses
// play() without a tap and paints a play-button glyph over the video, so the
// video is swapped for a static transparent PNG. Geometry transcribed from
// Figma 2405:876 "IPHONE EDIT" (402×874 guide): the untrimmed 1078×1235
// still sits at x -132.47 / y 178.99 at 755.67×866.22; converted here to the
// trimmed PNG's content box (bbox 230,30–965,1235 of the original). The
// figure bleeds off the right and bottom of the screen like the guide.
const STATIC_FALLBACK_SRC = '/loader/character-static.png'
const STATIC = {
  top: '22.89vh',                       // antenna tips just under the title
  height: '96.7vh',                     // width follows (735:1205 aspect)
  left: 'calc(71.24vw - 29.48vh)',      // centre at 71.24vw; 29.48vh = half width
}

export default function CharacterLoader({
  webmSrc,
  hevcSrc,
  // White-background master (H.264 mp4 — plays natively in every browser).
  // When set it wins over the alpha pair, and the video gets
  // mix-blend-mode: multiply so the baked white background reads as
  // transparent over the page (white multiplies to invisible).
  mp4Src,
  title = 'EA Battlefield X Lisle Abrahams',
}) {
  // phase: 'hero' → 'docking' → 'docked' (desktop) | 'fading' → 'gone' (mobile)
  const [phase, setPhase] = useState('hero')
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  // Mobile only: autoplay refused (iOS Low Power Mode) → static image fallback.
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const videoRef = useRef(null)
  const boxRef = useRef(null)
  const dockedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Pick the source: white-bg mp4 wins (universal playback); otherwise the
  // alpha pair by codec support. No loop during the hero — the choreography
  // waits for 'ended' so the full animation always plays once.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    let blockTimer = 0
    const markBlocked = () => {
      // Only mobile swaps to the static image; desktop machines don't have
      // Low Power Mode autoplay blocking in practice, and the safety timeout
      // already covers any desktop playback failure.
      if (window.innerWidth < MOBILE_BREAKPOINT) setAutoplayBlocked(true)
    }
    const canWebm = v.canPlayType('video/webm; codecs="vp9"')
    const src = mp4Src || (canWebm ? webmSrc : (hevcSrc || webmSrc))
    if (src && v.src !== src) {
      // Boomerang master (forward + reversed baked in): ends on its first
      // frame, so looping is seamless — no cut back to the beginning.
      v.loop = true
      v.src = src
      const p = v.play()
      // iOS Low Power Mode rejects play() with NotAllowedError. Belt and
      // braces: if the video still hasn't started shortly after, treat it as
      // blocked too (some Safari builds stall instead of rejecting).
      if (p && p.catch) p.catch(markBlocked)
      blockTimer = setTimeout(() => {
        if (v.paused && v.currentTime === 0) markBlocked()
      }, 900)
    }
    return () => clearTimeout(blockTimer)
  }, [webmSrc, hevcSrc, mp4Src])

  // Choreography: hold the hero until the animation has played through once
  // ('ended' + beat), then dock (desktop) or fade out (mobile). Safety
  // timeout covers autoplay/network failure so the page is never trapped.
  useEffect(() => {
    let reduced = false
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) {}

    const mobile = window.innerWidth < MOBILE_BREAKPOINT
    const v = videoRef.current

    // Lock scroll during the hero moment.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const release = () => { document.body.style.overflow = prevOverflow }

    let beatTimeout = 0
    let settleTimeout = 0
    let safetyTimeout = 0
    let done = false

    const startDock = () => {
      if (done) return
      done = true
      release()
      if (mobile) {
        setPhase('fading')
      } else {
        setPhase('docking')
        if (v) {
          v.playbackRate = DOCKED_RATE
          const p = v.play()
          if (p && p.catch) p.catch(() => {})
        }
      }
      settleTimeout = setTimeout(() => {
        setPhase(mobile ? 'gone' : 'docked')
        dockedRef.current = true
        try { localStorage.setItem('lisle_intro_seen', '1') } catch (e) {}
      }, mobile ? MOBILE_FADE_MS : (DOCK_MS + 100))
    }

    // The file is a baked boomerang (forward + reversed): the hero is the
    // forward pass, so dock once playback crosses the halfway point. The
    // rewind then plays out during the slide and the docked loop.
    let armed = false
    const onTime = () => {
      if (armed || !v || !v.duration) return
      if (v.currentTime >= v.duration / 2) {
        armed = true
        beatTimeout = setTimeout(startDock, POST_END_BEAT_MS)
      }
    }
    const onEnded = () => {
      beatTimeout = setTimeout(startDock, POST_END_BEAT_MS)
    }

    if (reduced) {
      startDock()
    } else {
      if (v) {
        v.addEventListener('timeupdate', onTime)
        v.addEventListener('ended', onEnded)
      }
      safetyTimeout = setTimeout(startDock, SAFETY_DOCK_MS)
    }

    return () => {
      if (v) {
        v.removeEventListener('timeupdate', onTime)
        v.removeEventListener('ended', onEnded)
      }
      clearTimeout(beatTimeout)
      clearTimeout(settleTimeout)
      clearTimeout(safetyTimeout)
      release()
    }
  }, [])

  // Docked hover — the video sits behind the page content (z -1), so it
  // never receives pointer events directly; track the mouse instead and
  // sharpen when it's over the docked sliver.
  useEffect(() => {
    if (phase !== 'docked' || isMobile) return
    const onMove = (e) => {
      const box = videoRef.current
      if (!box) return
      const r = box.getBoundingClientRect()
      // Left ~29% of the frame is empty white — only the character region
      // should trigger the hover sharpen.
      const charLeft = r.left + r.width * 0.29
      setHovered(
        e.clientX >= charLeft && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom
      )
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [phase, isMobile])

  if (phase === 'gone') return null

  const hero = phase === 'hero'
  const docking = phase === 'docking'
  const docked = phase === 'docked'
  const behind = docked   // video tucks behind the page content once settled
  const overlayInteractive = hero || phase === 'fading'
  const fadingOut = phase === 'fading'

  const ease = 'cubic-bezier(0.65, 0, 0.35, 1)'

  // Video box: Figma placement per breakpoint. Before hydration (mounted
  // false) render the desktop hero so SSR shows a sane first paint; the
  // white overlay covers any pre-hydration shuffle anyway.
  const mob = mounted && isMobile
  const blurPx = hero ? 0 : (docked && hovered ? 0 : D.blurDocked)
  const videoStyle = {
    position: 'fixed',
    ...(mob
      ? { left: M.boxLeft, top: M.boxTop, width: M.boxWidth, height: M.boxHeight }
      : {
          left: hero ? D.boxLeftHero : D.boxLeftDocked,
          top: D.boxTop,
          width: D.boxWidth,
          height: D.boxHeight,
        }),
    // Above the curtain while the character is the show; tucks behind the
    // page content (above the page background) once fully docked.
    zIndex: behind ? -1 : 99998,
    // Tailwind preflight caps video at max-width:100% — must be lifted or the
    // natural-aspect width gets squashed to the viewport (and crops again).
    maxWidth: 'none',
    objectFit: 'cover',
    objectPosition: '60% 50%',
    display: 'block',
    filter: `blur(${blurPx}px)`,
    // Mobile never slides — the left/filter transitions are desktop dock
    // choreography only (they made the mobile frame drift into place on load).
    transition: mob
      ? (fadingOut ? `opacity ${MOBILE_FADE_MS}ms ease-out` : 'none')
      : `left ${DOCK_MS}ms ${ease}, filter ${docked ? HOVER_SHARPEN_MS : DOCK_MS}ms ${ease}`,
    opacity: fadingOut ? 0 : 1,
    pointerEvents: 'none',
    // White-bg master: the video is a DIRECT child of the root stacking
    // context (no wrapper), so multiply genuinely blends with the page —
    // the baked white background melts into whatever is behind it (the
    // curtain during the hero, the page once revealed). Alpha masters need
    // no blending.
    ...(mp4Src ? { mixBlendMode: 'multiply' } : {}),
  }

  return (
    <>
      {/* White curtain — above the content, below the video. Solid through
          the hero, then fades over the slide; the character glides over it
          (and over the emerging content) blended, never as a white box. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#fff',
          zIndex: 99997,
          opacity: hero ? 1 : 0,
          transition: `opacity ${fadingOut ? MOBILE_FADE_MS : DOCK_MS}ms ${ease}`,
          pointerEvents: overlayInteractive ? 'auto' : 'none',
        }}
      />

      {/* Character video — one element, continuous slide, no layer swaps
          mid-flight. On mobile with autoplay blocked (iOS Low Power Mode)
          the video is removed entirely — unmounting it kills the OS play
          glyph — and a static transparent PNG stands in, sitting below the
          title copy and anchored to the bottom of the screen. */}
      {mob && autoplayBlocked ? (
        <img
          src={STATIC_FALLBACK_SRC}
          alt=""
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: STATIC.left,
            top: STATIC.top,
            height: STATIC.height,
            width: 'auto',
            // Tailwind preflight caps img at max-width:100% — must be lifted
            // or the vh-driven width gets squashed (same trap as the video).
            maxWidth: 'none',
            zIndex: 99998,
            pointerEvents: 'none',
            opacity: fadingOut ? 0 : 1,
            transition: fadingOut ? `opacity ${MOBILE_FADE_MS}ms ease-out` : 'none',
          }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          disablePictureInPicture
          aria-hidden={hero ? 'false' : 'true'}
          style={videoStyle}
        />
      )}

      {/* Title — Geist Mono, landing type size, capitalize (Figma 2301:3658) */}
      {!behind && (
        <p
          style={{
            position: 'fixed',
            left: mob ? '50vw' : D.titleLeft,
            top: mob ? M.titleTop : D.titleTop,
            transform: 'translateX(-50%)',
            width: mob ? 'min(332.977px, 88vw)' : '332.977px',
            margin: 0,
            zIndex: 99999,
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            // Same size as the landing intro type (Portfolio desktop intro).
            fontSize: 'clamp(10px, 0.72vw, 18px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.05em',
            textTransform: 'capitalize',
            textAlign: 'center',
            // Mobile: the full-height character sits behind the title, so
            // blend like the site chrome — white in difference reads black
            // on white and white on the dark helmet.
            ...(mob ? { color: '#fff', mixBlendMode: 'difference' } : { color: '#000' }),
            wordBreak: 'break-word',
            opacity: hero ? 1 : 0,
            transition: `opacity ${TITLE_FADE_MS}ms ease-out`,
            pointerEvents: 'none',
          }}
        >
          {title}
        </p>
      )}
    </>
  )
}
