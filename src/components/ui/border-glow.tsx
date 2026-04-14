'use client'

import { useRef, useState, useCallback, type ReactNode, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface BorderGlowProps {
  children: ReactNode
  className?: string
  /** Card background color */
  backgroundColor?: string
  /** Border radius in px */
  borderRadius?: number
  /** HSL values without the hsl() wrapper, e.g. "270 60 70" */
  glowColor?: string
  /** Gradient color stops for the glow sweep */
  colors?: string[]
  /** 0–1 opacity multiplier for the glow */
  glowIntensity?: number
  /** px radius of the glow circle */
  glowRadius?: number
  /** px distance from edge that activates glow */
  edgeSensitivity?: number
  /** Whether glow auto-animates (not implemented — glow is always hover-only) */
  animated?: boolean
}

export function BorderGlow({
  children,
  className,
  backgroundColor = '#ffffff',
  borderRadius = 16,
  glowColor = '270 60 70',
  glowIntensity = 0.6,
  glowRadius = 120,
  edgeSensitivity = 30,
  animated: _animated = false,
}: BorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [glowStyle, setGlowStyle] = useState<CSSProperties>({})
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      // Show glow at any cursor position — the radial gradient naturally
      // illuminates the nearest edge most when the cursor is close to it.
      setGlowStyle({
        '--glow-x':   `${x}px`,
        '--glow-y':   `${y}px`,
        '--glow-r':   `${glowRadius}px`,
        '--glow-op':  String(glowIntensity),
        '--glow-hsl': glowColor,
      } as CSSProperties)
    },
    [glowRadius, glowIntensity, glowColor],
  )

  const handleMouseLeave = useCallback(() => {
    setGlowStyle({})
    setHovered(false)
  }, [])

  const handleMouseEnter = useCallback(() => setHovered(true), [])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        borderRadius,
        backgroundColor,
        ...glowStyle,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Edge glow pseudo-layer */}
      {hovered && Object.keys(glowStyle).length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            borderRadius,
            background: `radial-gradient(
              circle var(--glow-r) at var(--glow-x) var(--glow-y),
              hsl(var(--glow-hsl) / var(--glow-op)),
              transparent 70%
            )`,
          }}
        />
      )}

      {/* Static border — visible at rest, replaced by glow on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          borderRadius,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
          opacity: hovered ? 0 : 1,
        }}
      />

      {/* Glowing border ring — appears on hover */}
      {hovered && Object.keys(glowStyle).length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            borderRadius,
            boxShadow: `inset 0 0 0 1.5px hsl(${glowColor} / 0.45)`,
          }}
        />
      )}

      {/* Content — pointer-events-none so mouse events always reach the container */}
      <div className="pointer-events-none relative z-10 select-none">{children}</div>
    </div>
  )
}
