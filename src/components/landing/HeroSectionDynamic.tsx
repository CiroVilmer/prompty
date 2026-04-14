'use client'

import dynamic from 'next/dynamic'

// ssr: false prevents the Math.random() hydration mismatch from WarpBackground
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white" />,
})

export default HeroSection
