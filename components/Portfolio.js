/*
 ██████╗  ██████╗  ██████╗ ██╗         ██████╗  █████╗ ██╗   ██╗
 ██╔══██╗██╔═══██╗██╔═══██╗██║         ██╔══██╗██╔══██╗╚██╗ ██╔╝
 ██████╔╝██║   ██║██║   ██║██║         ██║  ██║███████║ ╚████╔╝ 
 ██╔═══╝ ██║   ██║██║   ██║██║         ██║  ██║██╔══██║  ╚██╔╝  
 ██║     ╚██████╔╝╚██████╔╝███████╗    ██████╔╝██║  ██║   ██║   
 ╚═╝      ╚═════╝  ╚═════╝ ╚══════╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
                                                                 
 Built in 48 hours by Lisle Abrahams
 Hey pool.day team! Thanks for checking under the hood 👀
*/

'use client'

import { useState, useEffect, useRef } from 'react'
import DuckCanvas from './DuckCanvas'
import VideoPlayer from './VideoPlayer'

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

function ParallaxModule({ backgroundImage, backgroundImageMobile, foregroundImage, foregroundImageMobile, intensity = 5, alt }) {
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

  const bgSrc = isMobile && backgroundImageMobile ? backgroundImageMobile : backgroundImage
  const fgSrc = isMobile && foregroundImageMobile ? foregroundImageMobile : foregroundImage

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
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: `translateY(${bgOffset}px)`,
        willChange: 'transform',
        zIndex: 1
      }}>
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
      </div>

      {/* Foreground Layer */}
      <div style={{
        position: 'absolute',
        top: isMobile ? '0' : '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        transform: isMobile 
          ? `translateX(-50%) translateY(${fgOffset}px)`
          : `translate(-50%, -50%) translateY(${fgOffset}px)`,
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
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
      </div>
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

function FullWidthVideo({ src, alt, desktopWidth = '100' }) {
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
      margin: '0 auto',
      marginLeft: isMobile ? '12px' : 'auto',
      marginRight: isMobile ? '12px' : 'auto',
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
      >
        <source src={src} type="video/webm" />
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}

export default function Portfolio({ introText, projects, duckModelUrl }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showProjects, setShowProjects] = useState(false)
  const [expandedProject, setExpandedProject] = useState(null)
  const [currentDescription, setCurrentDescription] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [ducks, setDucks] = useState([])
  const [imageBlurs, setImageBlurs] = useState({})
  const [showElements, setShowElements] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState('none') // 'none', 'blurOut', 'blurIn'
  const [backgroundColor, setBackgroundColor] = useState('#fff')
  const [isMobile, setIsMobile] = useState(false)
  
  const mediaRefs = useRef([])

  const actualIntroText = `Welcome to the folio of Lisle Abrahams!

I challenged myself to concept and build this portfolio in 48 hours — just for you at Random Access Memories Co. I'm here for the Content Lead role, or any creative lead space that needs filling. I've spent years shaping digital and brand stories at Highsnobiety, but what excites me most is building at the frontier of human-AI collaboration.

Honestly, I'm at a moment in my life where I'm looking for something genuine — a place that excites me, where I wake up wanting to work.
Pool feels like that. I'd love to help define the voice, the universe, and the story of what you're building.

Curious, creative, kind, and ready to ship... Enjoy — much love, Lisle`

  // Typing animation for intro
  useEffect(() => {
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
        }, 300)
      }
    }, 20)

    return () => clearInterval(typingInterval)
  }, [projects])

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
            if (mediaItem?.description) {
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
  }, [expandedProject, projects])

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

  // Detect color triggers on scroll
  useEffect(() => {
    if (!expandedProject) return

    const observers = []

    mediaRefs.current.forEach((ref, index) => {
      if (!ref || !ref.dataset.colorTrigger) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const color = ref.dataset.colorValue
            setBackgroundColor(color || '#ffffff')
          }
        },
        { 
          threshold: 0.5,  // Trigger when element is at middle
          rootMargin: '0px'
        }
      )

      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach(obs => obs.disconnect())
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
      {/* Desktop Fixed Header - OUTSIDE main container */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: 0,
          margin: 0,
          color: '#fff',
          mixBlendMode: 'difference',
          fontFamily: '"Geist Mono", monospace',
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 300
        }}>
          {/* Intro Text */}
          <div style={{ 
            whiteSpace: 'pre-wrap',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: 300,
            maxWidth: '60vw'
          }}>
            {displayedText}
            {!showProjects && <span style={{ animation: 'blink 1s infinite' }}>_</span>}
          </div>

          {/* Project List + Description */}
          {showProjects && (
            <div style={{ 
              display: 'flex',
              paddingTop: '20px',
              paddingLeft: '60px',
              marginTop: '20px',
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
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontWeight: 300,
                      padding: '4px 0',
                      cursor: 'pointer',
                      color: 'inherit',
                      opacity: expandedProject === project._id ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => {
                      if (expandedProject !== project._id) {
                        e.target.style.opacity = 0.6
                      }
                    }}
                  >
                    &gt;Project-{String(i + 1).padStart(2, '0')}_{project.title.replace(/\s+/g, '_')}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div style={{ 
                flex: '0 0 auto',
                width: 'min(450px, 30vw)',
                fontSize: '12px',
                lineHeight: '16px',
                fontWeight: 300,
                opacity: showElements ? 1 : 0,
                transform: showElements ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
              }}>
                {expandedProject && projects?.find(p => p._id === expandedProject) && (() => {
                  const project = projects.find(p => p._id === expandedProject)
                  const displayText = currentDescription || project?.description || ''
                  console.log('DISPLAYING:', { currentDescription, projectDescription: project?.description, displayText })
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

      {/* Duck Me Baby Button - Desktop Only */}
      {!isMobile && (
        <button
          onClick={() => setDucks([...ducks, { id: Date.now() }])}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontFamily: '"Geist Mono", monospace',
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: 300,
            cursor: 'pointer',
            color: '#fff',
            mixBlendMode: 'difference',
            zIndex: 1001
          }}
        >
          Duck Me Baby
        </button>
      )}

      {/* Clear My Ducks Button - Desktop Only */}
      {!isMobile && ducks.length > 0 && (
        <button
          onClick={() => {
            // Trigger clearing animation - DuckCanvas will handle the actual removal
            window.dispatchEvent(new CustomEvent('clearDucks'))
          }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '180px',
            background: 'none',
            border: 'none',
            fontFamily: '"Geist Mono", monospace',
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: 300,
            cursor: 'pointer',
            color: '#fff',
            mixBlendMode: 'difference',
            zIndex: 1001
          }}
        >
          Clear My Ducks
        </button>
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
        filter: transitionPhase !== 'none' ? 'blur(30px)' : 'blur(0px)',
        fontFamily: '"Geist Mono", monospace',
        fontSize: '12px',
        lineHeight: '16px',
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
              zIndex: 100,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '12px',
              paddingRight: '12px',
              color: '#fff',
              mixBlendMode: 'difference'
            }}>
              {/* Duck Me Baby Buttons */}
              <div style={{ marginBottom: '12px', display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => setDucks([...ducks, { id: Date.now() }])}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 300,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: '#fff',
                    mixBlendMode: 'difference',
                    padding: 0
                  }}
                >
                  Duck Me Baby
                </button>
                {ducks.length > 0 && (
                  <button
                    onClick={() => {
                      // Trigger clearing animation - DuckCanvas will handle the actual removal
                      window.dispatchEvent(new CustomEvent('clearDucks'))
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontWeight: 300,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      color: '#fff',
                      mixBlendMode: 'difference',
                      padding: 0
                    }}
                  >
                    Clear My Ducks
                  </button>
                )}
              </div>

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
                    foregroundImage={media.foregroundImageUrl}
                    foregroundImageMobile={media.foregroundImageMobileUrl}
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
            
            // VIDEO
            if (media._type === 'file' || media.asset?.mimeType?.startsWith('video/')) {
              // Full width autoplay video
              if (media.videoDisplayType === 'fullWidth') {
                return (
                  <FullWidthVideo
                    key={`${expandedProject}-${imgNum}`}
                    src={media.asset.url}
                    alt={media.alt || ''}
                    desktopWidth={media.desktopWidth || '100'}
                  />
                )
              }
              
              // Mobile: 9:16 cropped full height video
              if (isMobile && media.mobileFullHeight === true) {
                return (
                  <div 
                    key={`${expandedProject}-${imgNum}`}
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
                    >
                      <source src={media.asset.url} type="video/mp4" />
                    </video>
                  </div>
                )
              }
              
              // Default: collapsed thumbnail with expand
              return (
                <div 
                  key={`${expandedProject}-${imgNum}`}
                  ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                  style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    marginLeft: 0,
                    marginRight: 0,
                    marginBottom: isMobile ? '16px' : 0,
                    filter: `blur(${imageBlurs[imgNum] || 0}px)`,
                    transition: 'filter 0.05s linear'
                  }}
                >
                  <VideoPlayer
                    src={media.asset.url}
                    alt={media.alt || ''}
                    style={{
                      width: '500px',
                      height: '500px'
                    }}
                  />
                </div>
              )
            }
            
            // REGULAR IMAGE
            if (!media.asset?.url) return null  // Skip if no URL
            
            return (
              <img
                key={`${expandedProject}-${imgNum}`}
                ref={(el) => { if (el) mediaRefs.current[imgNum] = el }}
                src={isMobile && media.mobileImageUrl ? media.mobileImageUrl : media.asset.url}
                alt={media.alt || `Project image ${imgNum + 1}`}
                style={{
                  width: isMobile ? 'calc(100vw - 24px)' : `min(calc(100vw - 120px), ${media.desktopWidth || 100}%)`,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  marginBottom: isMobile ? '16px' : '30px',
                  objectFit: 'contain',
                  filter: `blur(${imageBlurs[imgNum] || 0}px)`,
                  transition: 'filter 0.05s linear'
                }}
              />
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
                    <div>© 2025</div>
                    <div>pool.day folio application</div>
                    <div>Built in 48 hours</div>
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

      <DuckCanvas ducks={ducks} onClose={() => setDucks([])} modelUrl={duckModelUrl} />

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