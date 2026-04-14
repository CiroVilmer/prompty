"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSectionDynamic";
import Problem from "@/components/sections/Problem";
import BeforeAfterSection from "@/components/sections/BeforeAfterSection";
import WhyPrompty from "@/components/sections/WhyPrompty";
import Footer from "@/components/sections/Footer";
import LoadingScreen from "@/components/layout/LoadingScreen";

export default function LandingPage() {
  // heroReady: fires when LoadingScreen exit starts → triggers hero stagger
  const [heroReady, setHeroReady] = useState(false);
  // overlayDone: fires when slide-up tween completes → safe to unmount overlay
  const [overlayDone, setOverlayDone] = useState(false);

  return (
    <>
      {/* Keep LoadingScreen mounted until its exit tween fully completes.
          Unmounting early kills the GSAP slide-up animation. */}
      {!overlayDone && (
        <LoadingScreen
          onComplete={() => setHeroReady(true)}
          onExited={() => setOverlayDone(true)}
        />
      )}

      <div className={`bg-white ${heroReady ? "" : "invisible"}`}>
        <Navbar />
        <main>
          <HeroSection loadingComplete={heroReady} />
          <BeforeAfterSection />
          <WhyPrompty />
        </main>
        <Footer />
      </div>
    </>
  );
}
