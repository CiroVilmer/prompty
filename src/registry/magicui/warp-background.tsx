'use client'

import { useId, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface WarpBackgroundProps {
  children?: ReactNode
  className?: string
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
}

function BeamVertical({
  left,
  size,
  duration,
  delay,
}: {
  left: string
  size: number
  duration: number
  delay: number
}) {
  return (
    <div
      aria-hidden
      style={
        {
          position: 'absolute',
          left,
          top: '-320px',
          width: `${size}px`,
          height: '320px',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(34,211,238,0.5) 50%, transparent 100%)',
          transform: 'translateX(-50%)',
          animation: `warp-beam-v ${duration}s linear ${delay}s infinite`,
          pointerEvents: 'none',
          zIndex: 3,
        } as CSSProperties
      }
    />
  )
}

function BeamHorizontal({
  top,
  size,
  duration,
  delay,
}: {
  top: string
  size: number
  duration: number
  delay: number
}) {
  return (
    <div
      aria-hidden
      style={
        {
          position: 'absolute',
          top,
          left: '-320px',
          height: `${size}px`,
          width: '320px',
          background:
            'linear-gradient(to right, transparent 0%, rgba(34,211,238,0.35) 50%, transparent 100%)',
          transform: 'translateY(-50%)',
          animation: `warp-beam-h ${duration}s linear ${delay}s infinite`,
          pointerEvents: 'none',
          zIndex: 3,
        } as CSSProperties
      }
    />
  )
}

export function WarpBackground({
  children,
  className,
  perspective = 100,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = 'rgba(255,255,255,0.055)',
}: WarpBackgroundProps) {
  const id = useId()

  const positions = Array.from(
    { length: beamsPerSide },
    (_, i) => `${Math.round(((i + 1) / (beamsPerSide + 1)) * 100)}%`,
  )

  const gridSize = Math.max(32, perspective / 2.5)

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: '#0a0f1c' }}
    >
      {/* ── Perspective warp grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ perspective: `${perspective * 9}px` }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            height: '200%',
            backgroundImage: [
              `linear-gradient(${gridColor} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
            ].join(', '),
            backgroundSize: `${gridSize}px ${gridSize}px`,
            transform: `rotateX(${Math.min(72, perspective * 0.72)}deg)`,
            transformOrigin: '50% 0%',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 75%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 75%)',
          }}
        />
      </div>

      {/* ── Radial depth vignette ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -5%, transparent 35%, #0a0f1c 100%)',
          zIndex: 1,
        }}
      />

      {/* ── Top / bottom edge fades ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #0a0f1c 0%, transparent 12%, transparent 88%, #0a0f1c 100%)',
          zIndex: 2,
        }}
      />

      {/* ── Vertical beams ── */}
      {positions.map((pos, i) => (
        <BeamVertical
          key={`${id}-v-${i}`}
          left={pos}
          size={beamSize}
          duration={beamDuration}
          delay={
            beamDelayMin + (i / beamsPerSide) * (beamDelayMax - beamDelayMin)
          }
        />
      ))}

      {/* ── Horizontal beams ── */}
      {positions.map((pos, i) => (
        <BeamHorizontal
          key={`${id}-h-${i}`}
          top={pos}
          size={beamSize}
          duration={beamDuration}
          delay={
            beamDelayMin +
            (i / beamsPerSide) * (beamDelayMax - beamDelayMin) +
            beamDuration / 2
          }
        />
      ))}

      {/* ── Content ── */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}
