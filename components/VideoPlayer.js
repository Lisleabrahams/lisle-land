'use client'

import { AnimatePresence, motion, useSpring } from 'framer-motion'
import { Play, Plus } from 'lucide-react'
import { useState } from 'react'

export default function VideoPlayer({ src, alt, style, className }) {
  const [showVideoPopOver, setShowVideoPopOver] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    setCursorPos({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    })
  }

  return (
    <>
      <AnimatePresence>
        {showVideoPopOver && (
          <VideoPopOver 
            src={src}
            setShowVideoPopOver={setShowVideoPopOver} 
          />
        )}
      </AnimatePresence>
      
      <div
        onClick={() => setShowVideoPopOver(true)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowCursor(true)}
        onMouseLeave={() => setShowCursor(false)}
        style={{ 
          ...style, 
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          width: style?.width || '500px',
          height: style?.height || style?.width || '500px',  // Use provided height or make square
          aspectRatio: style?.height ? 'auto' : '1/1'  // Only enforce square if no height specified
        }}
        className={className}
      >
        {/* Cursor follower */}
        {showCursor && (
          <div style={{
            position: 'absolute',
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            fontSize: '14px',
            mixBlendMode: 'difference'
          }}>
            <Play style={{ width: '16px', height: '16px', fill: 'white' }} />
            Play
          </div>
        )}
        
        <video
          autoPlay
          muted
          playsInline
          loop
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',  // Crops to fill square
            display: 'block'
          }}
        >
          <source src={src} type="video/webm" />
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </>
  )
}

const VideoPopOver = ({ src, setShowVideoPopOver }) => {
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 9999,
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(40px)'
        }}
        onClick={() => setShowVideoPopOver(false)}
      />
      
      <motion.div
        initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5%)", opacity: 0 }}
        animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
        exit={{
          clipPath: "inset(43.5% 43.5% 33.5% 43.5%)",
          opacity: 0,
          transition: {
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.2, delay: 0.8 },
          },
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          maxWidth: '1400px',
          width: '90vw'
        }}
      >
        <video
          src={src}
          autoPlay
          controls
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'contain'
          }}
        />

        <span
          onClick={() => setShowVideoPopOver(false)}
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            zIndex: 10,
            cursor: 'pointer',
            borderRadius: '50%',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Plus style={{ width: '20px', height: '20px', transform: 'rotate(45deg)', color: 'white' }} />
        </span>
      </motion.div>
    </div>
  )
}