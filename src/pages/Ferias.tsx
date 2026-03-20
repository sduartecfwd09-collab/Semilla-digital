import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeriasGrid from '../components/FeriasGrid'
import './Pages.css'

const FeriasPage: React.FC = () => {
  return (
    <div className="ferias-page page-container">
      <Navbar />
      <div className="page-header">
        <h1 className="page-title">Nuestras Ferias</h1>
        <p className="page-subtitle">
          Encontrá la feria más cercana a vos y disfrutá de los mejores productos frescos de Costa Rica.
        </p>
      </div>
      <FeriasGrid />
      <Footer />
    </div>
  )
}

export default FeriasPage
