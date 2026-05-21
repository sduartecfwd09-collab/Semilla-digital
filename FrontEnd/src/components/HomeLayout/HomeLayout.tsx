import React from 'react'
import Navbar from '../Navbar'
import HeroSection from '../HeroSection'
import StatsBar from '../StatsBar'
import FeaturesSection from '../FeaturesSection'
import Footer from '../Footer'

const HomeLayout: React.FC = () => {
  return (
    <div className="home-page">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default HomeLayout
