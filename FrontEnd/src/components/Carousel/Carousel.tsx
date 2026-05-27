import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ActiveFeriasCard from '../ActiveFeriasCard/ActiveFeriasCard'
import './Carousel.css'

interface SlideData {
  image: string
  tag: string
  title: string
  emText: string
  description: string
  ctaText: string
  ctaLink: string
  alt: string
}

const HERO_SLIDES: SlideData[] = [
  {
    image: '/assets/carrusel/carrusel4.jpg',
    tag: '🌿 Cosechas Frescas · Costa Rica',
    title: 'Frescura que inspira, ',
    emText: 'bienestar que se siente.',
    description: 'Traé a tu hogar lo mejor del campo costarricense. Frutas, verduras y hortalizas seleccionadas con la máxima frescura de nuestra tierra fértil.',
    ctaText: 'Ver Productos',
    ctaLink: '/comparar',
    alt: 'Mesa de madera rústica llena de frutas y vegetales frescos costarricenses'
  },
  {
    image: '/assets/carrusel/carrusel2.jpg',
    tag: '👨‍🌾 Tradición Rural · Costa Rica',
    title: 'El corazón de nuestros ',
    emText: 'agricultores locales.',
    description: 'Apoyá de forma directa el esfuerzo de familias productoras que cultivan con pasión y respeto por el medio ambiente.',
    ctaText: 'Explorar Ferias',
    ctaLink: '/ferias',
    alt: 'Agricultores trabajando al amanecer en un hermoso y fértil campo costarricense'
  },
  {
    image: '/assets/carrusel/carrusel3.jpg',
    tag: '🤝 Comunidad · Costa Rica',
    title: 'Mercados vivos llenos de ',
    emText: 'vida y tradición.',
    description: 'Redescubrí la calidez de nuestras ferias del agricultor. Compartí momentos, tradiciones y el sabor genuino de lo nuestro.',
    ctaText: 'Descubrir Recetas',
    ctaLink: '/recetas',
    alt: 'Señora comprando verduras frescas con una gran sonrisa a un productor local'
  },
  {
    image: '/assets/carrusel/carrusel1.jpg',
    tag: '🥦 Decisiones Inteligentes · Costa Rica',
    title: 'Compará precios y ',
    emText: 'comprá mejor hoy.',
    description: 'Consultá y compará precios actualizados en las diferentes ferias de tu región antes de salir de casa. Cuidá tu bolsillo con AgroMap.',
    ctaText: 'Comparar Precios',
    ctaLink: '/comparar',
    alt: 'Detalle de vegetales y legumbres de feria sobre un bodegón rústico oscuro'
  }
]

interface CarouselProps {
  variant?: 'hero' | 'compact'
  autoplaySpeed?: number
}

const Carousel: React.FC<CarouselProps> = ({ variant = 'hero', autoplaySpeed = 3500 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<any>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const slides = HERO_SLIDES

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setIsTransitioning(true)
        handleNext()
      }, autoplaySpeed)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, autoplaySpeed, handleNext])

  // Reset transition locks
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1200) // matches transition duration in CSS
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Pause on hover
  const handleMouseEnter = () => setIsPlaying(false)
  const handleMouseLeave = () => setIsPlaying(true)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return
      if (e.key === 'ArrowRight') {
        setIsTransitioning(true)
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        setIsTransitioning(true)
        handlePrev()
      }
    }
    const container = carouselRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleNext, handlePrev, isTransitioning])

  if (variant === 'compact') {
    // Compact mode for Admin Dashboard
    return (
      <div 
        ref={carouselRef}
        className="carousel-compact"
        role="region"
        aria-label="Galería de la Feria"
        tabIndex={0}
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`carousel-slide ${idx === currentIndex ? 'active' : ''}`}
            aria-hidden={idx !== currentIndex}
          >
            <div 
              className="slide-image"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="carousel-overlay" />
          </div>
        ))}
        
        <div className="compact-content">
          <span className="compact-tag">🌿 AgroMap Admin Portal</span>
          <h2 className="compact-title">Bienvenido al Centro de Control</h2>
          <p className="compact-desc">
            Gestionando la tradición y la tecnología agrícola costarricense para conectar productores y consumidores con la mayor transparencia.
          </p>
        </div>

        {/* Minimal Indicators */}
        <div className="carousel-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`indicator-bar ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true)
                  setCurrentIndex(idx)
                }
              }}
              aria-label={`Ir al slide ${idx + 1}`}
            >
              {idx === currentIndex && isPlaying && (
                <span 
                  className="indicator-progress" 
                  style={{ animationDuration: `${autoplaySpeed}ms` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Full Hero Variant
  return (
    <div 
      ref={carouselRef}
      className="carousel-hero-container"
      role="region"
      aria-label="Carrusel de la Feria del Agricultor"
      tabIndex={0}
    >
      <div className="carousel-slides-wrapper">
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`carousel-slide ${idx === currentIndex ? 'active' : ''}`}
            aria-hidden={idx !== currentIndex}
          >
            <div 
              className="slide-image"
              role="img"
              aria-label={slide.alt}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="carousel-overlay" />
            
            {/* Slide Content Overlay */}
            <div className="slide-content-container">
              <div className="slide-text-side">
                <span className="slide-tag">{slide.tag}</span>
                <h1 className="slide-title">
                  {slide.title}
                  <em>{slide.emText}</em>
                </h1>
                <p className="slide-description">{slide.description}</p>
                <div className="slide-buttons">
                  <Link to={slide.ctaLink} className="slide-btn-primary">
                    {slide.ctaText}
                  </Link>
                </div>
              </div>

              {/* Marcador de posición invisible para preservar la rejilla (grid) de layout */}
              <div className="carousel-card-placeholder" />
            </div>
          </div>
        ))}
      </div>

      {/* Tarjeta estática flotante que permanece fija y funcional */}
      <div className="carousel-static-card-container">
        <div className="carousel-static-card-wrapper">
          <ActiveFeriasCard />
        </div>
      </div>

      {/* Discrete Controls */}
      <button 
        onClick={() => {
          if (!isTransitioning) {
            setIsTransitioning(true)
            handlePrev()
          }
        }}
        className="carousel-btn btn-prev"
        aria-label="Slide anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        onClick={() => {
          if (!isTransitioning) {
            setIsTransitioning(true)
            handleNext()
          }
        }}
        className="carousel-btn btn-next"
        aria-label="Siguiente slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Minimal Progressive Indicators */}
      <div className="carousel-indicators">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`indicator-bar ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true)
                setCurrentIndex(idx)
              }
            }}
            aria-label={`Ir al slide ${idx + 1}`}
          >
            {idx === currentIndex && isPlaying && (
              <span 
                className="indicator-progress" 
                style={{ animationDuration: `${autoplaySpeed}ms` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Carousel
