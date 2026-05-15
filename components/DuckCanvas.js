'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useEffect, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Single duck component with its own physics
function Duck({ id, modelUrl, allDucksRef, onDragStart, draggingId, isClearing }) {
  const meshRef = useRef()
  const { viewport, size } = useThree()
  
  // Physics state in refs (not React state - avoids re-renders)
  const physics = useRef({
    position: [Math.random() * 4 - 2, 6 + Math.random() * 2, 0],
    velocity: [(Math.random() - 0.5) * 0.05, 0, 0],
    rotation: [0, Math.PI + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2],
    angularVel: [(Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.05]
  })

  const hasAppliedClearForce = useRef(false)

  // Register this duck's physics ref
  useEffect(() => {
    allDucksRef.current[id] = physics
    return () => {
      delete allDucksRef.current[id]
    }
  }, [id, allDucksRef])

  // Reset clear force ref when clearing ends
  useEffect(() => {
    if (!isClearing) {
      hasAppliedClearForce.current = false
    }
  }, [isClearing])

  const gravity = -0.008
  const damping = 0.98
  const bounceDamping = 0.3
  const angularDamping = 0.96
  const duckRadius = 0.4
  const maxAngularVel = 0.15

  useFrame(() => {
    if (!meshRef.current) return
    
    const p = physics.current
    const isDragging = draggingId === id

    // If clearing, apply acceleration over time (ease-in effect)
    if (isClearing) {
      // Set random direction once
      if (!hasAppliedClearForce.current) {
        hasAppliedClearForce.current = true
        // Store random direction for this duck
        p.clearDirectionX = (Math.random() - 0.5) * 0.02
        p.clearDirectionY = 0.01 + Math.random() * 0.01
      }
      
      // Apply acceleration each frame (ease-in effect)
      p.velocity[0] += p.clearDirectionX
      p.velocity[1] += p.clearDirectionY
      p.angularVel[0] += (Math.random() - 0.5) * 0.02
      p.angularVel[2] += (Math.random() - 0.5) * 0.02
    }

    if (!isDragging && !isClearing) {
      // Apply gravity
      p.velocity[1] += gravity

      // Apply damping
      p.velocity[0] *= damping
      p.velocity[1] *= damping
      p.angularVel[0] *= angularDamping
      p.angularVel[1] *= angularDamping
      p.angularVel[2] *= angularDamping

      // If duck is nearly stationary, stop rotation
      const speed = Math.abs(p.velocity[0]) + Math.abs(p.velocity[1])
      if (speed < 0.005) {
        p.angularVel[0] *= 0.9
        p.angularVel[2] *= 0.9
      }

      // Clamp angular velocity to prevent crazy spinning
      p.angularVel[0] = Math.max(-maxAngularVel, Math.min(maxAngularVel, p.angularVel[0]))
      p.angularVel[2] = Math.max(-maxAngularVel, Math.min(maxAngularVel, p.angularVel[2]))

      // Wall collisions - browser window is the boundary
      const bounds = {
        left: -viewport.width / 2 + duckRadius,
        right: viewport.width / 2 - duckRadius,
        bottom: -viewport.height / 2 + duckRadius,  // Actual bottom of screen
        top: viewport.height / 2 - duckRadius
      }

      if (p.position[0] < bounds.left) {
        p.position[0] = bounds.left
        p.velocity[0] = Math.abs(p.velocity[0]) * bounceDamping
        if (Math.abs(p.angularVel[2]) < maxAngularVel * 0.5) p.angularVel[2] -= 0.03
      }
      if (p.position[0] > bounds.right) {
        p.position[0] = bounds.right
        p.velocity[0] = -Math.abs(p.velocity[0]) * bounceDamping
        if (Math.abs(p.angularVel[2]) < maxAngularVel * 0.5) p.angularVel[2] += 0.03
      }
      if (p.position[1] < bounds.bottom) {
        p.position[1] = bounds.bottom
        p.velocity[1] = Math.abs(p.velocity[1]) * bounceDamping
        if (Math.abs(p.angularVel[0]) < maxAngularVel * 0.5) p.angularVel[0] += p.velocity[0] * 0.2
        
        // Stop tiny bounces and vibration
        if (Math.abs(p.velocity[1]) < 0.02) {
          p.velocity[1] = 0
          p.velocity[0] *= 0.8  // Slow horizontal movement too
        }
        
        // If duck is nearly stationary, kill all micro-movements
        const totalVelocity = Math.abs(p.velocity[0]) + Math.abs(p.velocity[1])
        if (totalVelocity < 0.01 && p.position[1] <= bounds.bottom + 0.1) {
          p.velocity[0] = 0
          p.velocity[1] = 0
          p.angularVel[0] *= 0.5
          p.angularVel[2] *= 0.5
        }
      }
      if (p.position[1] > bounds.top) {
        p.position[1] = bounds.top
        p.velocity[1] = -Math.abs(p.velocity[1]) * bounceDamping
      }

      // Duck-to-duck collisions
      Object.entries(allDucksRef.current).forEach(([otherId, otherPhysics]) => {
        if (otherId === String(id)) return
        
        const other = otherPhysics.current
        const dx = other.position[0] - p.position[0]
        const dy = other.position[1] - p.position[1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = duckRadius * 2

        if (dist < minDist && dist > 0.01) {
          // Separate - stronger push if deeply overlapping
          const overlap = (minDist - dist) / 2
          const pushStrength = overlap > 0.1 ? 1.5 : 1  // Extra push if badly stuck
          const nx = dx / dist
          const ny = dy / dist
          
          p.position[0] -= nx * overlap * pushStrength
          p.position[1] -= ny * overlap * pushStrength
          
          // Bounce velocity
          const relVelX = p.velocity[0] - other.velocity[0]
          const relVelY = p.velocity[1] - other.velocity[1]
          const relVelDot = relVelX * nx + relVelY * ny
          
          if (relVelDot > 0) {
            p.velocity[0] -= relVelDot * nx * 0.5
            p.velocity[1] -= relVelDot * ny * 0.5
            // Add small spin only if not already spinning fast
            if (Math.abs(p.angularVel[2]) < maxAngularVel * 0.5) {
              p.angularVel[2] += (Math.random() - 0.5) * 0.03
            }
            if (Math.abs(p.angularVel[0]) < maxAngularVel * 0.5) {
              p.angularVel[0] += (Math.random() - 0.5) * 0.03
            }
          }
        }
      })
    }

    // Always update position and rotation (even when clearing)
    if (isClearing || !isDragging) {
      p.position[0] += p.velocity[0]
      p.position[1] += p.velocity[1]
      p.rotation[0] += p.angularVel[0]
      p.rotation[2] += p.angularVel[2]
    }

    // Apply to mesh
    meshRef.current.position.set(p.position[0], p.position[1], p.position[2])
    meshRef.current.rotation.set(p.rotation[0], p.rotation[1], p.rotation[2])
  })

  const handlePointerDown = (e) => {
    e.stopPropagation()
    
    const screenToWorld = (clientX, clientY) => {
      const x = (clientX / size.width) * 2 - 1
      const y = -(clientY / size.height) * 2 + 1
      return [x * (viewport.width / 2), y * (viewport.height / 2), 0]
    }
    
    onDragStart(id, physics, screenToWorld)
  }

  return (
    <group ref={meshRef}>
      {/* Clickable hitbox */}
      <mesh onPointerDown={handlePointerDown}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      
      {modelUrl ? (
        <Suspense fallback={null}>
          <DuckModel modelUrl={modelUrl} />
        </Suspense>
      ) : (
        <mesh scale={0.5}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )}
    </group>
  )
}

// Duck model with yellow material applied
function DuckModel({ modelUrl }) {
  const { scene } = useGLTF(modelUrl)
  const clonedScene = scene.clone()
  
  // Apply yellow rubber duck material to all meshes
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.3,
        metalness: 0.1,
      })
    }
  })
  
  return <primitive object={clonedScene} scale={0.5} />
}

export default function DuckCanvas({ ducks, onClose, modelUrl }) {
  const [mounted, setMounted] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const [isClearing, setIsClearing] = useState(false)
  const allDucksRef = useRef({})
  const dragRef = useRef({ physics: null, screenToWorld: null, prevMouse: [0, 0], velTracker: [0, 0] })
  
  useEffect(() => {
    setMounted(true)
    if (modelUrl) {
      useGLTF.preload(modelUrl)
    }
    
    // Listen for clear event from parent
    const handleClearEvent = () => {
      if (ducks.length > 0) {
        setIsClearing(true)
        setTimeout(() => {
          onClose()
          setIsClearing(false)
        }, 1000)
      }
    }
    
    window.addEventListener('clearDucks', handleClearEvent)
    return () => window.removeEventListener('clearDucks', handleClearEvent)
  }, [modelUrl, ducks.length, onClose])

  // Handle clear animation
  useEffect(() => {
    if (ducks.length === 0) {
      setIsClearing(false)
    }
  }, [ducks.length])

  const handleDragStart = (id, physicsRef, screenToWorld) => {
    setDraggingId(id)
    dragRef.current = {
      physics: physicsRef,
      screenToWorld,
      prevMouse: [0, 0],
      velTracker: [0, 0]
    }
    
    // Stop current motion
    physicsRef.current.velocity = [0, 0, 0]
    physicsRef.current.angularVel = [0, 0, 0]

    const handleMove = (e) => {
      const dr = dragRef.current
      if (!dr.physics || !dr.screenToWorld) return
      
      const worldPos = dr.screenToWorld(e.clientX, e.clientY)
      dr.physics.current.position = worldPos
      
      // Track velocity for throw
      if (dr.prevMouse[0] !== 0) {
        dr.velTracker = [
          (e.clientX - dr.prevMouse[0]) * 0.002,
          -(e.clientY - dr.prevMouse[1]) * 0.002
        ]
      }
      dr.prevMouse = [e.clientX, e.clientY]
    }

    const handleUp = () => {
      const dr = dragRef.current
      if (dr.physics) {
        // Apply throw velocity
        dr.physics.current.velocity = [dr.velTracker[0], dr.velTracker[1], 0]
        // Add spin based on throw
        dr.physics.current.angularVel = [
          dr.velTracker[1] * 2,
          0,
          -dr.velTracker[0] * 2
        ]
      }
      setDraggingId(null)
      dragRef.current = { physics: null, screenToWorld: null, prevMouse: [0, 0], velTracker: [0, 0] }
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  // Clean up refs for removed ducks
  useEffect(() => {
    const currentIds = new Set(ducks.map(d => String(d.id)))
    Object.keys(allDucksRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        delete allDucksRef.current[id]
      }
    })
  }, [ducks.length])

  const handleClear = () => {
    if (ducks.length === 0) return
    setIsClearing(true)
    setTimeout(() => {
      onClose()
      setIsClearing(false)
    }, 1000)
  }

  if (!mounted || (!ducks || ducks.length === 0) && !isClearing) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 500,
        pointerEvents: 'auto'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        
        {ducks.map((duck) => (
          <Duck
            key={duck.id}
            id={duck.id}
            modelUrl={modelUrl}
            allDucksRef={allDucksRef}
            onDragStart={handleDragStart}
            draggingId={draggingId}
            isClearing={isClearing}
          />
        ))}
      </Canvas>
    </div>
  )
}