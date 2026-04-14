import { Navbar } from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSectionDynamic'

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  )
}
