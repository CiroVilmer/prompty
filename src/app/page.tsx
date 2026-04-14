"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSectionDynamic";
import LoadingScreen from "@/components/layout/LoadingScreen";

export default function LandingPage() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <>
      {!loadingComplete && (
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      )}

      <div className={`bg-white ${loadingComplete ? "" : "invisible"}`}>
        <Navbar />
        <main>
          <HeroSection />
        </main>
      </div>
    </>
  );
}
