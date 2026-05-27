import React from 'react'
import Navbar from '../Navbar'
import Carousel from '../Carousel'
import StatsBar from '../StatsBar'
import FeaturesSection from '../FeaturesSection'
import Footer from '../Footer'

const HomeLayout: React.FC = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Carousel variant="hero" />
      <StatsBar />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default HomeLayout
