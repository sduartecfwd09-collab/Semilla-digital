import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StatsBar from '../components/StatsBar'
import FeaturesSection from '../components/FeaturesSection'
import FeriasGrid from '../components/FeriasGrid'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <FeriasGrid />
      <Footer />
    </div>
  )
}

export default Home
