"use client"

import { useLayoutEffect, useRef } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

/** Per rough-notation: number, [vertical, horizontal], or [top, right, bottom, left]. */
export type HighlighterPadding =
  | number
  | [number, number]
  | [number, number, number, number]

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: HighlighterPadding
  /** Multiline inline text: one underline/highlight per line. */
  multiline?: boolean
  /** When true, draw iterations right-to-left first (rough-notation). */
  rtl?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  rtl,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null

    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
        ...(typeof rtl === "boolean" ? { rtl } : {}),
      }

      const currentAnnotation = annotate(element, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide()
        currentAnnotation.show()
      })

      resizeObserver.observe(element)
      resizeObserver.observe(document.body)
    }

    return () => {
      annotation?.remove()
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
    rtl,
  ])

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  )
}
