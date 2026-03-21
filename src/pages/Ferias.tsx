import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeriasGrid from '../components/FeriasGrid'
import './Pages.css'

const FeriasPage: React.FC = () => {
  return (
    <div className="ferias-page page-container">
      <Navbar />
      <div style={{ marginTop: '80px' }}></div> {/* Espacio para el Navbar */}
      <FeriasGrid />
      <Footer />
    </div>
  )
}

export default FeriasPage
