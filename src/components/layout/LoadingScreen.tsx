"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
  onExited?: () => void;
}

const VIDEO_DURATION_S = 3;
const EXIT_DURATION_S = 0.8;

export default function LoadingScreen({ onComplete, onExited }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Flips to true the moment we call .play() — starts the CSS bar animation
  const [barActive, setBarActive] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.body.style.overflow = "hidden";

    // ── Reduced-motion path ──────────────────────────────────────────────────
    // Content is immediately visible (CSS overrides opacity/transform).
    // Hold 1.5 s then fade-out; no slide, no video.
    if (prefersReduced) {
      const timer = window.setTimeout(() => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            document.body.style.overflow = "";
            onComplete();
          },
        });
      }, 1500);

      return () => {
        window.clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }

    // ── Full animation path ──────────────────────────────────────────────────
    // Guard against exit() firing more than once (ended + fallback race).
    let exited = false;

    // Fallback: fire exit if onEnded never triggers
    const fallback = window.setTimeout(
      () => exit(),
      (VIDEO_DURATION_S + 0.1) * 1000
    );

    function exit() {
      if (exited) return;
      exited = true;
      window.clearTimeout(fallback);

      // Capture the DOM node before onComplete() potentially re-renders parent.
      // The captured reference survives React nullifying the ref after unmount.
      const overlay = overlayRef.current;

      // Restore scroll and signal parent NOW — hero entrance starts at t=0 of
      // the curtain rise so content appears to emerge from behind it.
      document.body.style.overflow = "";
      onComplete();

      // Slide the overlay upward. onExited fires only after the full 0.8 s so
      // the parent never unmounts this component while the animation is running.
      if (overlay) {
        gsap.to(overlay, {
          yPercent: -100,
          duration: EXIT_DURATION_S,
          ease: "power3.inOut",
          onComplete: () => {
            // Do NOT call overlay.remove() — React unmounts the node cleanly
            // when onExited sets overlayDone=true. Removing it manually first
            // causes a "removeChild: not a child" crash on the React unmount pass.
            onExited?.();
          },
        });
      } else {
        onExited?.();
      }
    }

    const vidEl = videoRef.current;
    vidEl?.addEventListener("ended", exit, { once: true });

    // iOS Safari needs muted/playsInline set as DOM properties, not just
    // React attributes. Without this, play() is silently rejected on mobile.
    if (vidEl) {
      vidEl.muted = true;
      vidEl.defaultMuted = true;
      vidEl.playsInline = true;
      vidEl.setAttribute("muted", "");
      vidEl.setAttribute("playsinline", "");
      vidEl.setAttribute("webkit-playsinline", "");
    }

    // ── All three things start simultaneously on mount ───────────────────────
    // 1. Entrance tween — container rises from y:40 + fades in over 0.6 s
    gsap.to(contentRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    // 2. Video — retry play() until it succeeds. Mobile browsers reject the
    //    initial call if the video hasn't buffered enough, so we also wire up
    //    canplay/loadedmetadata listeners as a backstop.
    setBarActive(true);

    const tryPlay = () => {
      const p = vidEl?.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Retry once the element reports it can play.
        });
      }
    };

    if (vidEl) {
      if (vidEl.readyState >= 2) {
        tryPlay();
      } else {
        vidEl.addEventListener("loadedmetadata", tryPlay, { once: true });
        vidEl.addEventListener("canplay", tryPlay, { once: true });
        vidEl.load();
        tryPlay();
      }
    }

    // 3. Bar animation is driven by the CSS class toggled by setBarActive above

    return () => {
      window.clearTimeout(fallback);
      vidEl?.removeEventListener("ended", exit);
      vidEl?.removeEventListener("loadedmetadata", tryPlay);
      vidEl?.removeEventListener("canplay", tryPlay);
      document.body.style.overflow = "";
      // Kill entrance tween only — the exit tween targets a captured local
      // variable and survives unmount intentionally; don't cancel it here.
      gsap.killTweensOf(contentRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={overlayRef} className="ls-overlay" aria-hidden="true">
      {/*
        Content wrapper — starts offset + invisible via inline CSS so the
        initial state is correct even before GSAP runs.
        The reduced-motion override in the <style> block makes it immediately
        visible when animations are disabled.
      */}
      <div
        ref={contentRef}
        className="ls-content"
        style={{ opacity: 0, transform: "translateY(40px)" }}
      >
        <video
          ref={videoRef}
          src="/videos/logo_loading.mp4"
          muted
          playsInline
          autoPlay
          preload="auto"
          className="ls-video"
          {...({
            "webkit-playsinline": "true",
            "x5-playsinline": "true",
          } as Record<string, string>)}
        />

        <div className="ls-bar-track">
          <div className={`ls-bar-fill${barActive ? " ls-bar-active" : ""}`} />
        </div>
      </div>

      <style>{`
        .ls-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ls-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          /* Initial state is set via inline style above so GSAP can tween from it */
        }

        /* Reduced-motion: skip entrance — show content immediately */
        @media (prefers-reduced-motion: reduce) {
          .ls-content {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        .ls-video {
          width: 320px;
          height: 320px;
          object-fit: contain;
          display: block;
        }
        @media (max-width: 480px) {
          .ls-video { width: 220px; height: 220px; }
        }

        .ls-bar-track {
          margin-top: 24px;
          width: 320px;
          height: 2px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .ls-bar-track { width: 220px; }
        }

        /* Bar fill — animation defined but paused until .ls-bar-active is set */
        .ls-bar-fill {
          height: 100%;
          width: 0%;
          background: #fff;
          border-radius: 9999px;
          animation: lsBarFill ${VIDEO_DURATION_S}s cubic-bezier(0.42, 0, 0.58, 1) forwards;
          animation-play-state: paused;
        }
        .ls-bar-fill.ls-bar-active {
          animation-play-state: running;
        }

        @keyframes lsBarFill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ls-bar-fill {
            animation: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
