'use client'

import { useState, useEffect, useRef } from 'react'
import { boldNames } from './boldText'

// Horizontal Scroll Image Component
function HorizontalScrollImage({ src, alt }) {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const [offset, setOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop: scroll-based horizontal movement
  useEffect(() => {
    if (isMobile) return
    
    const handleScroll = () => {
      if (!containerRef.current || !imageRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const containerHeight = container.offsetHeight
      const viewportHeight = window.innerHeight

      if (rect.top > viewportHeight || rect.bottom < 0) return

      const progress = Math.max(0, Math.min(1, 
        (viewportHeight - rect.top) / (containerHeight + viewportHeight)
      ))

      const imageWidth = imageRef.current.offsetWidth
      const viewportWidth = window.innerWidth
      const maxOffset = Math.max(0, imageWidth - viewportWidth)
      
      setOffset(-progress * maxOffset)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isMobile])

  // MOBILE LAYOUT - Native horizontal scroll
  if (isMobile) {
    return (
      <div
        className="horizontal-scroll-mobile"
        style={{
          width: '100vw',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingLeft: '196px',
          marginBottom: '16px'
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            height: '70vh',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>
    )
  }

  // DESKTOP LAYOUT
  return (
    <div
      ref={containerRef}
      style={{
        height: '200vh',
        position: 'relative',
        width: '100%'
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#fff'
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          style={{
            height: '100vh',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'cover',
            transform: `translateX(${offset}px)`,
            willChange: 'transform'
          }}
        />
      </div>
    </div>
  )
}

function ParallaxModule({ backgroundImage, backgroundImageMobile, backgroundVideo, backgroundVideoMobile, foregroundImage, foregroundImageMobile, foregroundVideo, foregroundVideoMobile, backgroundWidth = '100', backgroundPosition = 'center', foregroundWidth = '100', foregroundPosition = 'center', intensity = 5, alt }) {
  const containerRef = useRef(null)
  const [bgOffset, setBgOffset] = useState(0)
  const [fgOffset, setFgOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Calculate how far through the viewport the container is (-1 to 1)
      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height)
      const normalizedProgress = Math.max(-0.5, Math.min(1.5, scrollProgress))
      
      // Intensity affects how much separation there is (0-10 scale)
      const multiplier = intensity / 5 // 5 is baseline, so 5 = 1x, 10 = 2x, 0 = 0x
      
      // Background moves slower (negative direction)
      const bgMovement = normalizedProgress * -100 * multiplier
      setBgOffset(bgMovement)
      
      // Foreground moves faster (positive direction)  
      const fgMovement = normalizedProgress * 50 * multiplier
      setFgOffset(fgMovement)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [intensity])

  // Prefer the breakpoint-specific image, but fall back to the other one so a
  // missing field in Sanity never renders a broken <img>.
  const bgSrc = (isMobile ? backgroundImageMobile || backgroundImage : backgroundImage || backgroundImageMobile) || null
  // A background video takes precedence over the background image when set.
  const bgVideoSrc = (isMobile ? backgroundVideoMobile || backgroundVideo : backgroundVideo || backgroundVideoMobile) || null
  const fgSrc = (isMobile ? foregroundImageMobile || foregroundImage : foregroundImage || foregroundImageMobile) || null
  // A foreground video takes precedence over the foreground image when set.
  const fgVideoSrc = (isMobile ? foregroundVideoMobile || foregroundVideo : foregroundVideo || foregroundVideoMobile) || null

  // Desktop-only width/position per layer (mobile stays full width, like the
  // singular image modules' "Desktop width (%)" control). 'center' keeps the
  // pre-control behaviour, so existing modules render unchanged.
  const layerX = (position) =>
    position === 'left' ? { left: 0 } : position === 'right' ? { right: 0 } : { left: '50%' }
  const centerShift = (position) => (position === 'center' ? 'translateX(-50%) ' : '')

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: isMobile ? 'calc(100vw - 24px)' : 'calc(100vw - 120px)',
        minHeight: '100vh',
        marginLeft: isMobile ? '12px' : '60px',
        marginRight: isMobile ? '12px' : '60px',
        marginBottom: isMobile ? '16px' : '100px',
        overflow: 'visible',
        backgroundColor: '#fff'
      }}
    >
      {/* Background Layer */}
      {(bgVideoSrc || bgSrc) && <div style={{
        position: 'absolute',
        top: 0,
        ...(isMobile ? { left: 0 } : layerX(backgroundPosition)),
        width: isMobile ? '100%' : `${backgroundWidth}%`,
        height: '100%',
        transform: `${isMobile ? '' : centerShift(backgroundPosition)}translateY(${bgOffset}px)`,
        willChange: 'transform',
        zIndex: 1
      }}>
        {bgVideoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            src={bgVideoSrc}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        ) : (
          <img
            src={bgSrc}
            alt={alt || 'Background layer'}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        )}
      </div>}

      {/* Foreground Layer */}
      {(fgVideoSrc || fgSrc) && <div style={{
        position: 'absolute',
        top: isMobile ? '0' : '50%',
        ...(isMobile ? { left: '50%' } : layerX(foregroundPosition)),
        width: isMobile ? '100%' : `${foregroundWidth}%`,
        height: '100%',
        transform: isMobile 
          ? `translateX(-50%) translateY(${fgOffset}px)`
          : `${centerShift(foregroundPosition)}translateY(-50%) translateY(${fgOffset}px)`,
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {fgVideoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            src={fgVideoSrc}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        ) : (
          <img
            src={fgSrc}
            alt={alt || 'Foreground layer'}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        )}
      </div>}
    </div>
  )
}

function SplitScreenModule({ leftImage, rightImage, fullBleedSide, parallaxIntensity = 5, mobileLayout, framedImageSize = '80', alt }) {
  const containerRef = useRef(null)
  const [leftOffset, setLeftOffset] = useState(0)
  const [rightOffset, setRightOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Calculate scroll progress (-1 to 1)
      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height)
      const normalizedProgress = Math.max(-0.5, Math.min(1.5, scrollProgress))
      
      // Intensity multiplier (0-10 scale, 5 = baseline)
      const multiplier = parallaxIntensity / 5
      
      // Full bleed side moves slower
      const fullBleedMovement = normalizedProgress * -80 * multiplier
      
      // Framed side moves faster
      const framedMovement = normalizedProgress * 80 * multiplier
      
      if (fullBleedSide === 'left') {
        setLeftOffset(fullBleedMovement)
        setRightOffset(framedMovement)
      } else {
        setLeftOffset(framedMovement)
        setRightOffset(fullBleedMovement)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [parallaxIntensity, fullBleedSide])

  // On mobile, ensure framed image is at least 80% even if desktop setting is smaller
  const effectiveFramedSize = isMobile ? Math.max(80, parseInt(framedImageSize)) : framedImageSize

  // Mobile layout
  if (isMobile) {
    const fullBleedImg = fullBleedSide === 'left' ? leftImage : rightImage
    const framedImg = fullBleedSide === 'left' ? rightImage : leftImage
    const isFullBleedTop = mobileLayout === 'fullBleedTop'

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          marginBottom: '0'
        }}
      >
        {/* Full bleed image */}
        <div style={{
          width: '100%',
          order: isFullBleedTop ? 0 : 1,
          marginBottom: isFullBleedTop ? '16px' : 0,
          marginTop: isFullBleedTop ? 0 : '16px'
        }}>
          <img
            src={fullBleedImg}
            alt={alt || 'Full bleed'}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Framed image */}
        <div style={{
          width: '100%',
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          order: isFullBleedTop ? 1 : 0
        }}>
          <img
            src={framedImg}
            alt={alt || 'Framed'}
            style={{
              width: `${effectiveFramedSize}%`,
              maxWidth: `${effectiveFramedSize}%`,
              height: 'auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '0'
      }}
    >
      {/* Left side */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fullBleedSide === 'right' ? '60px' : '0'
      }}>
        <div style={{
          width: fullBleedSide === 'left' ? '100%' : `${effectiveFramedSize}%`,
          maxWidth: fullBleedSide === 'left' ? '100%' : `${effectiveFramedSize}%`,
          height: 'auto',
          transform: `translateY(${leftOffset}px)`,
          willChange: 'transform'
        }}>
          <img
            src={leftImage}
            alt={alt || 'Left image'}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: fullBleedSide === 'left' ? 'cover' : 'contain'
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fullBleedSide === 'left' ? '60px' : '0'
      }}>
        <div style={{
          width: fullBleedSide === 'right' ? '100%' : `${effectiveFramedSize}%`,
          maxWidth: fullBleedSide === 'right' ? '100%' : `${effectiveFramedSize}%`,
          height: 'auto',
          transform: `translateY(${rightOffset}px)`,
          willChange: 'transform'
        }}>
          <img
            src={rightImage}
            alt={alt || 'Right image'}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: fullBleedSide === 'right' ? 'cover' : 'contain'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Scroll-driven drift wrapper for singular image modules. The outer div is
// the (untransformed) measuring element so the offset never feeds back into
// its own rect; the inner div carries the transform. amount 0 renders inert.
function ScrollParallaxImage({ amount = 0, children }) {
  const measureRef = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!amount) return
    const handleScroll = () => {
      if (!measureRef.current) return
      const rect = measureRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height)
      const normalized = Math.max(-0.5, Math.min(1.5, progress))
      // Same scale as the parallax module background: 5 = baseline.
      setOffset(normalized * -100 * (amount / 5))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [amount])

  if (!amount) return children
  return (
    <div ref={measureRef}>
      <div style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}

function FullWidthVideo({ src, alt, desktopWidth = '100', desktopPosition = 'center' }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div style={{
      width: isMobile ? 'calc(100vw - 24px)' : `${desktopWidth}%`,
      maxWidth: isMobile ? 'none' : 'calc(100vw - 120px)',
      // Desktop-only horizontal position; centre is the default.
      // Left/right sit flush to the 60px page gutters.
      margin: '0 auto',
      marginLeft: isMobile ? '12px' : (desktopPosition === 'left' ? '60px' : 'auto'),
      marginRight: isMobile ? '12px' : (desktopPosition === 'right' ? '60px' : 'auto'),
      marginBottom: isMobile ? '16px' : '30px'
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: 'auto',
          display: 'block'
        }}
        src={src}
      />
    </div>
  )
}

export default function Portfolio({ introText, projects, clientName = '', isPitch = false }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showProjects, setShowProjects] = useState(false)
  const [expandedProject, setExpandedProject] = useState(null)
  const [currentDescription, setCurrentDescription] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [imageBlurs, setImageBlurs] = useState({})
  const [showElements, setShowElements] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState('none') // 'none', 'blurOut', 'blurIn'
  const [backgroundColor, setBackgroundColor] = useState('#fff')
  const [isMobile, setIsMobile] = useState(false)

  const mediaRefs = useRef([])

  // Per-pitch override: when an `introText` prop is supplied (pitch pages),
  // it replaces the default site intro. Falls back to the canonical copy —
  // one solid paragraph (shorter on mobile).
  const desktopIntro = `Lisle Abrahams is an AI-augmented creative studio of one — directing brand worlds, motion, editorial systems and AI-generated content pipelines for clients shipping at the frontier. A way of working where idea, direction and build live in one set of hands, moving fluidly between concept and craft, art direction and execution. I treat AI as a collaborator rather than a shortcut: a tool for making work that feels considered, strange, and quietly alive, fast enough to keep pace with the brands betting on what comes next. Curious, creative, kind, and built to move fast.`
  const mobileIntro = `Lisle Abrahams is an AI-augmented studio of one — directing brand worlds, motion, editorial systems and AI-generated content for clients at the frontier. Idea, direction and build in one set of hands, with AI as a collaborator. Curious, creative, kind, and built to move fast.`
  const actualIntroText = introText || (isMobile ? mobileIntro : desktopIntro)

  // Typing animation for intro. On repeat visits (already seen in this browser)
  // type ~4x faster and shorten the reveal delay so returning visitors aren't
  // made to wait through the full type-out. First-timers get the full effect.
  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem('lisle_intro_seen') === '1' } catch (e) {}
    const typeSpeed = seen ? 5 : 20
    const postDelay = seen ? 100 : 300

    let i = 0
    const typingInterval = setInterval(() => {
      if (i < actualIntroText.length) {
        setDisplayedText(actualIntroText.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setShowProjects(true)
          setTimeout(() => setShowElements(true), 100)  // Trigger animations 100ms after
          if (projects && projects.length > 0) {
            setExpandedProject(projects[0]._id)
          }
          try { localStorage.setItem('lisle_intro_seen', '1') } catch (e) {}
        }, postDelay)
      }
    }, typeSpeed)

    return () => clearInterval(typingInterval)
  }, [projects, isMobile])

  // Typing animation for descriptions
  useEffect(() => {
    if (!currentDescription || !isTyping) return

    let i = 0
    const text = currentDescription
    setCurrentDescription('')
    
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setCurrentDescription(text.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
      }
    }, 8)

    return () => clearInterval(typingInterval)
  }, [isTyping])

  // Viewport-based description changes
  useEffect(() => {
    if (!expandedProject || !projects) return

    const observers = []
    const currentProjectId = expandedProject

    mediaRefs.current.forEach((ref, index) => {
      if (!ref) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Only update if we're still on the same project
          if (entry.isIntersecting && currentProjectId === expandedProject) {
            const currentProject = projects?.find(p => p._id === expandedProject)
            if (!currentProject) return  // Guard clause
            
            const mediaItem = currentProject.media?.[index]

            // Only update if this media item has a description AND belongs to current project
            if (isPitch) {
              // Pitch pages: project Description always leads; captions never
              // override it (belt-and-braces with the render-level guard below).
              setCurrentDescription(currentProject.description || '')
            } else if (mediaItem?.description) {
              setCurrentDescription(mediaItem.description)
              setIsTyping(true)
            } else if (index === 0) {
              // First item - show project description
              setCurrentDescription(currentProject.description || '')
            }
          }
        },
        { threshold: 0.5 }
      )

      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach(obs => obs.disconnect())
    }
  }, [expandedProject, projects, isPitch])

  // Initialize with real project description from Sanity
  useEffect(() => {
    if (expandedProject && projects) {
      const currentProject = projects.find(p => p._id === expandedProject)
      if (currentProject) {
        setCurrentDescription(currentProject.description || '')
        setIsTyping(false)
      }
    }
  }, [expandedProject, projects])

  // Blur-to-sharp snap effect
  useEffect(() => {
    if (!expandedProject) return

    const handleScroll = () => {
      const blurs = {}
      
      mediaRefs.current.forEach((ref, index) => {
        if (!ref) return
        
        const rect = ref.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const distanceFromBottom = viewportHeight - rect.top
        
        // Gradual blur from 0px to 100px distance from bottom
        // Blur starts at 20px when entering, fades to 0 at 100px
        if (distanceFromBottom < 0) {
          blurs[index] = 20  // Not yet visible
        } else if (distanceFromBottom < 100) {
          // Gradual transition: 20px blur → 0px blur over 100px of scroll
          const progress = distanceFromBottom / 100
          blurs[index] = 20 * (1 - progress)  // Linear fade from 20 to 0
        } else {
          blurs[index] = 0   // Fully sharp
        }
      })
      
      setImageBlurs(blurs)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [expandedProject])

  // Reset blurs when project changes
  useEffect(() => {
    setImageBlurs({})
    mediaRefs.current = []  // Reset media refs when project changes
  }, [expandedProject])

  // Background colour triggers — deterministic scroll handler.
  // Reads the markers straight from the DOM each scroll (mediaRefs gets reset
  // on project change, which raced the old IntersectionObserver and left it
  // attached to nothing). The active colour is the last marker whose top has
  // scrolled above its activation line (`activationPoint`% from the top of the
  // viewport). Stack triggers white → red → white and it fades through them.
  useEffect(() => {
    if (!expandedProject) return

    const applyColour = () => {
      const markers = document.querySelectorAll('[data-color-trigger="true"]')
      if (!markers.length) return
      const vh = window.innerHeight
      let activeColour = '#ffffff'
      markers.forEach((el) => {
        const ap = Math.min(100, Math.max(1, Number(el.dataset.activationPoint) || 50))
        const line = (ap / 100) * vh
        if (el.getBoundingClientRect().top <= line) {
          activeColour = el.dataset.colorValue || '#ffffff'
        }
      })
      setBackgroundColor(activeColour)
    }

    // Run after paint so the markers exist, then on every scroll/resize.
    const raf = requestAnimationFrame(applyColour)
    window.addEventListener('scroll', applyColour, { passive: true })
    window.addEventListener('resize', applyColour)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', applyColour)
      window.removeEventListener('resize', applyColour)
    }
  }, [expandedProject])

  // Reset background when project changes
  useEffect(() => {
    setBackgroundColor('#fff')
  }, [expandedProject])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      {/* Desktop Fixed Header - OUTSIDE main container.
          z-index sits ABOVE the edge-blur bands (10000) so the intro copy and
          project nav stay sharp while the scrolling work still blurs. */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10001,
          padding: '30px 30px 0',
          margin: 0,
          color: '#fff',
          mixBlendMode: 'difference',
          fontFamily: '"Geist Mono", monospace',
          // Fluid type — ~10px on laptops, up to 18px on large external screens.
          fontSize: 'clamp(10px, 0.72vw, 18px)',
          lineHeight: 1.3,
          fontWeight: 300
        }}>
          {/* Intro Text — stretched ~full width, name bolded */}
          <div style={{
            whiteSpace: 'pre-wrap',
            padding: 0,
            margin: 0,
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontWeight: 300,
            maxWidth: '100%'
          }}>
            {boldNames(displayedText, ['Lisle Abrahams', clientName])}
            {!showProjects && <span style={{ animation: 'blink 1s infinite' }}>_</span>}
          </div>

          {/* Project List + Description */}
          {showProjects && (
            <div style={{
              display: 'flex',
              paddingTop: '12px',
              paddingLeft: '0px',
              marginTop: '12px',
              gap: '40px'
            }}>
              {/* Project Names */}
              <div style={{
                flex: '0 0 auto',
                minWidth: '200px',
                opacity: showElements ? 1 : 0,
                transform: showElements ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
              }}>
                {projects?.map((project, i) => (
                  <button
                    key={project._id}
                    onClick={() => {
                      if (project._id === expandedProject) return
                      
                      setCurrentDescription('')  // Clear description immediately
                      setTransitionPhase('blurOut')
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setExpandedProject(project._id)
                        window.scrollTo({ top: 0, behavior: 'auto' })
                        setTransitionPhase('blurIn')
                        setTimeout(() => {
                          setTransitionPhase('none')
                          setIsTransitioning(false)
                        }, 400)
                      }, 400)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: 'inherit',
                      fontWeight: 300,
                      padding: '4px 0',
                      cursor: 'pointer',
                      color: 'inherit',
                      // Selected = sharp; everything else heavy-blurred until hovered.
                      opacity: expandedProject === project._id ? 1 : 0.6,
                      filter: expandedProject === project._id ? 'blur(0px)' : 'blur(5.2px)',
                      transition: 'filter 0.3s ease, opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = 1
                      e.currentTarget.style.filter = 'blur(0px)'
                    }}
                    onMouseLeave={(e) => {
                      if (expandedProject !== project._id) {
                        e.currentTarget.style.opacity = 0.6
                        e.currentTarget.style.filter = 'blur(5.2px)'
                      }
                    }}
                  >
                    {expandedProject === project._id ? '•' : '>'}Project-{String(i + 1).padStart(2, '0')}_{project.title.replace(/\s+/g, '_')}
                  </button>
                ))}
              </div>

              {/* Description — stretched wide + slightly rotated.
                  marginTop clears the intro AND the upward swing of the rotation
                  (which scales with width), so it never collides on any size. */}
              <div style={{
                flex: '0 0 auto',
                width: 'min(1083px, 74vw)',
                marginTop: 'clamp(28px, 4vw, 70px)',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                fontWeight: 300,
                transformOrigin: 'left center',
                opacity: showElements ? 1 : 0,
                transform: showElements ? 'rotate(-2.48deg) scale(1)' : 'rotate(-2.48deg) scale(0.95)',
                transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
              }}>
                {expandedProject && projects?.find(p => p._id === expandedProject) && (() => {
                  const project = projects.find(p => p._id === expandedProject)
                  // Pitch pages: always show the project's own Description. Media
                  // captions (leftover placeholders) were stomping it via the
                  // scroll observer. Main site keeps the caption-on-scroll behaviour.
                  const displayText = isPitch
                    ? (project?.description || '')
                    : (currentDescription || project?.description || '')
                  return (
                    <div>
                      {displayText}
                      {isTyping && <span style={{ animation: 'blink 0.8s infinite' }}>▊</span>}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blur transition overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        backdropFilter: transitionPhase !== 'none' ? 'blur(60px)' : 'blur(0px)',
        WebkitBackdropFilter: transitionPhase !== 'none' ? 'blur(60px)' : 'blur(0px)',
        zIndex: 9999,
        opacity: transitionPhase !== 'none' ? 1 : 0,
        transition: 'opacity 0.4s ease-in-out, backdrop-filter 0.4s ease-in-out',
        pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: backgroundColor,
        transition: 'background-color 0.6s ease, filter 0.4s ease-in-out',
        filter: transitionPhase !== 'none' ? 'blur(30px)' : 'none',
        fontFamily: '"Geist Mono", monospace',
        fontSize: '12px',
        lineHeight: 1.3,
        fontWeight: 300,
        color: '#1a1a1a',
        paddingTop: isMobile ? '20px' : '50vh',
        paddingBottom: '150px'
      }}>
        {/* Mobile Header - INSIDE main container */}
        {isMobile && (
          <>
            {/* Intro Text - Scrolls away */}
          <div style={{ 
            position: 'relative',
            whiteSpace: 'pre-wrap',
            padding: '0 12px',
            margin: 0,
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: 300,
            maxWidth: 'calc(100vw - 24px)',
            zIndex: 10001,
            color: '#1a1a1a',
            marginBottom: '20px'
          }}>
            {displayedText}
            {!showProjects && <span style={{ animation: 'blink 1s infinite' }}>_</span>}
          </div>

          {/* Project List + Buttons - Sticky (OUTSIDE intro, SEPARATE div) */}
          {showProjects && (
            <div style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'transparent',
              zIndex: 10001,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '12px',
              paddingRight: '12px',
              color: '#fff',
              mixBlendMode: 'difference'
            }}>
              {/* Project List */}
              <div style={{
                opacity: showElements ? 1 : 0,
                transform: showElements ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
              }}>
                {projects?.map((project, i) => (
                  <button
                    key={project._id}
                    onClick={() => {
                      if (project._id === expandedProject) return
                      
                      setCurrentDescription('')  // Clear description immediately
                      setTransitionPhase('blurOut')
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setExpandedProject(project._id)
                        window.scrollTo({ top: 0, behavior: 'auto' })
                        setTransitionPhase('blurIn')
                        setTimeout(() => {
                          setTransitionPhase('none')
                          setIsTransitioning(false)
                        }, 400)
                      }, 400)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontWeight: 300,
                      padding: '4px 0',
                      cursor: 'pointer',
                      color: '#fff',
                      opacity: expandedProject === project._id ? 1 : 0.6
                    }}
                  >
                    &gt;Project-{String(i + 1).padStart(2, '0')}_{project.title.replace(/\s+/g, '_')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Scrollable Media Section */}
      {expandedProject && (
        <div key={expandedProject}>
          {projects?.find(p => p._id === expandedProject)?.media?.map((media, imgNum) => {
            
            // BACKGROUND COLOR TRIGGER
            if (media._type === 'backgroundColorTrigger') {
              const colorValue = media.colorHex || media.quickPresets || '#ffffff'
              
              return (
                <div
                  key={`${expandedProject}-${imgNum}`}
                  ref={(el) => {
                    if (el) {
                      mediaRefs.current[imgNum] = el
                      el.dataset.colorTrigger = 'true'
                      el.dataset.colorValue = colorValue
                      el.dataset.activationPoint = String(media.activationPoint ?? 50)
                    }
                  }}
                  style={{
                    height: '1px',
                    width: '100%',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                />
              )
            }
            
            // SPACER MODULE
            if (media._type === 'spacer') {
              const heights = {
                small: '30px',
                medium: '60px',
                large: '120px',
                xlarge: '200px'
              }
              return (
                <div 
                  key={`${expandedProject}-${imgNum}`}
                  style={{
                    height: heights[media.size] || '60px',
                    width: '100%'
                  }}
                />
              )
            }
            
            // NEGATIVE SPACER — pulls the following module up (overlap).
            // Amount is % of the viewport height; later modules paint on top.
            if (media._type === 'negativeSpacer') {
              const pull = isMobile
                ? (media.mobileAmount ?? media.desktopAmount ?? 20)
                : (media.desktopAmount ?? 20)
              return (
                <div
                  key={`${expandedProject}-${imgNum}`}
                  style={{
                    height: 0,
                    marginTop: `-${pull}vh`,
                    width: '100%'
                  }}
                />
              )
            }

            // HORIZONTAL SCROLL IMAGE
            if (media._type === 'horizontalImage') {
              return (
                <div
                  key={`${expandedProject}-${imgNum}`}
                  ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                  style={{
                    marginBottom: isMobile ? '16px' : '30px',
                    filter: `blur(${imageBlurs[imgNum] || 0}px)`,
                    transition: 'filter 0.05s linear'
                  }}
                >
                  <HorizontalScrollImage
                    src={media.imageUrl || media.image?.asset?.url}
                    alt={media.alt || ''}
                  />
                </div>
              )
            }
            
            // PARALLAX MODULE
            if (media._type === 'parallaxModule') {
              return (
                <div
                  key={`${expandedProject}-${imgNum}`}
                  ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                  style={{
                    marginBottom: isMobile ? '16px' : '30px',
                    filter: `blur(${imageBlurs[imgNum] || 0}px)`,
                    transition: 'filter 0.05s linear'
                  }}
                >
                  <ParallaxModule
                    backgroundImage={media.backgroundImageUrl}
                    backgroundImageMobile={media.backgroundImageMobileUrl}
                    backgroundVideo={media.backgroundVideoUrl}
                    backgroundVideoMobile={media.backgroundVideoMobileUrl}
                    foregroundImage={media.foregroundImageUrl}
                    foregroundImageMobile={media.foregroundImageMobileUrl}
                    foregroundVideo={media.foregroundVideoUrl}
                    foregroundVideoMobile={media.foregroundVideoMobileUrl}
                    backgroundWidth={media.backgroundWidth || '100'}
                    backgroundPosition={media.backgroundPosition || 'center'}
                    foregroundWidth={media.foregroundWidth || '100'}
                    foregroundPosition={media.foregroundPosition || 'center'}
                    intensity={media.intensity || 5}
                    alt={media.alt || ''}
                  />
                </div>
              )
            }
            
            // SPLIT SCREEN MODULE
            if (media._type === 'splitScreenModule') {
              return (
                <div
                  key={`${expandedProject}-${imgNum}`}
                  ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                  style={{
                    marginBottom: isMobile ? '16px' : '30px',
                    filter: `blur(${imageBlurs[imgNum] || 0}px)`,
                    transition: 'filter 0.05s linear'
                  }}
                >
                  <SplitScreenModule
                    leftImage={media.leftImageUrl}
                    rightImage={media.rightImageUrl}
                    fullBleedSide={media.fullBleedSide}
                    parallaxIntensity={media.parallaxIntensity || 5}
                    mobileLayout={media.mobileLayout}
                    framedImageSize={media.framedImageSize || '80'}
                    alt={media.alt || ''}
                  />
                </div>
              )
            }
            
            // VIDEO — single path: inline autoplay video at the Sanity
            // "Desktop width (%)" control (100 = full-bleed, anything less is
            // contained + centred). The old fullWidth/contained display-type
            // dropdown and the collapsed click-to-expand player are gone.
            if (media._type === 'file' || media.asset?.mimeType?.startsWith('video/')) {
              if (!media.asset?.url) return null  // Skip if no file uploaded

              // Mobile: 9:16 cropped full-height video when flagged in Sanity
              if (isMobile && media.mobileFullHeight === true) {
                return (
                  <ScrollParallaxImage key={`${expandedProject}-${imgNum}`} amount={media.parallax || 0}>
                  <div 
                    ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                    style={{
                      width: '100vw',
                      height: '70vh',
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}
                  >
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      src={media.asset.url}
                    />
                  </div>
                  </ScrollParallaxImage>
                )
              }

              return (
                <ScrollParallaxImage key={`${expandedProject}-${imgNum}`} amount={media.parallax || 0}>
                  <FullWidthVideo
                    src={media.asset.url}
                    alt={media.alt || ''}
                    desktopWidth={media.desktopWidth || '100'}
                    desktopPosition={media.desktopPosition || 'center'}
                  />
                </ScrollParallaxImage>
              )
            }
            
            // REGULAR IMAGE
            if (!media.asset?.url) return null  // Skip if no URL

            return (
              <ScrollParallaxImage key={`${expandedProject}-${imgNum}`} amount={media.parallax || 0}>
              <img
                ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                src={isMobile && media.mobileImageUrl ? media.mobileImageUrl : media.asset.url}
                alt={media.alt || `Project image ${imgNum + 1}`}
                style={{
                  width: isMobile ? 'calc(100vw - 24px)' : `min(calc(100vw - 120px), ${media.desktopWidth || 100}%)`,
                  height: 'auto',
                  display: 'block',
                  // Desktop-only horizontal position; centre is the default.
                  // Left/right sit flush to the 60px page gutters.
                  margin: '0 auto',
                  ...(!isMobile && media.desktopPosition === 'left' ? { marginLeft: '60px', marginRight: 'auto' } : {}),
                  ...(!isMobile && media.desktopPosition === 'right' ? { marginLeft: 'auto', marginRight: '60px' } : {}),
                  marginBottom: isMobile ? '16px' : '30px',
                  objectFit: 'contain',
                  filter: `blur(${imageBlurs[imgNum] || 0}px)`,
                  transition: 'filter 0.05s linear'
                }}
              />
              </ScrollParallaxImage>
            )
          })}

          {/* Next Project Button */}
          {expandedProject && projects && (() => {
            const currentIndex = projects.findIndex(p => p._id === expandedProject)
            const nextIndex = (currentIndex + 1) % projects.length
            const nextProject = projects[nextIndex]
            
            if (!nextProject || currentIndex === -1) return null
            
            return (
              <div style={{
                width: isMobile ? 'calc(100vw - 24px)' : 'calc(100vw - 120px)',
                marginLeft: isMobile ? '12px' : '60px',
                marginRight: isMobile ? '12px' : '60px',
                marginTop: '60px',
                marginBottom: '100px',
                paddingTop: '40px'
              }}>
                {/* Next Project Link */}
                <button
                  onClick={() => {
                    if (nextProject._id === expandedProject) return
                    setCurrentDescription('')  // Clear description immediately
                    setTransitionPhase('blurOut')
                    setIsTransitioning(true)
                    setTimeout(() => {
                      setExpandedProject(nextProject._id)
                      window.scrollTo({ top: 0, behavior: 'auto' })
                      setTransitionPhase('blurIn')
                      setTimeout(() => {
                        setTransitionPhase('none')
                        setIsTransitioning(false)
                      }, 400)
                    }, 400)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 300,
                    cursor: 'pointer',
                    color: '#1a1a1a',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 0.6}
                  onMouseLeave={(e) => e.target.style.opacity = 1}
                >
                  Next Project → {nextProject.title}
                </button>
                
                {/* Footer Details */}
                <div style={{
                  marginTop: '60px'
                }}>
                  {/* Separator line aligned with images */}
                  <div style={{
                    width: '100%',
                    borderTop: '0.5px solid #999',
                    marginBottom: isMobile ? '30px' : '40px'
                  }} />
                  {/* Footer content with gutter spacing */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    gap: isMobile ? '20px' : '40px',
                    maxWidth: isMobile ? '100%' : '50%',
                    fontSize: '11px',
                    color: '#999'
                  }}>
                    <div>© 2026</div>
                    <div>lisle.land</div>
                    <a 
                      href="https://www.linkedin.com/in/lisle-abrahams-274764251/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#999', textDecoration: 'underline' }}
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .horizontal-scroll-mobile::-webkit-scrollbar {
          display: none;
        }
        
        ::selection {
          background: linear-gradient(90deg, #6B5CE7, #A855F7);
          background-color: #6B5CE7;
          color: #fff;
          -webkit-background-clip: text;
        }
        
        div::selection, p::selection, span::selection, button::selection {
          background-color: #F59629;
          color: #fff;
        }
        
        div::-moz-selection, p::-moz-selection, span::-moz-selection, button::-moz-selection {
          background-color: #F59629;
          color: #fff;
        }
      `}</style>
    </>
  )
}