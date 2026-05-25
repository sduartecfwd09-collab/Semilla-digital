import React, { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import { Clock, ShoppingBasket, ChefHat, ArrowRight } from 'lucide-react'
import './Recipes.css'
import { ENDPOINTS } from '../../services/api.config'
import { escapeHtml } from '../../utils/escapeHtml'

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  difficulty: string
  time: string
  image_url?: string | null
}

// Imagen subida a Cloudinary como public_id fijo `agromap/recetas/placeholder`.
// Se sirve sin versión para que cualquier reemplazo futuro del asset se refleje
// sin re-deploy del frontend.
const RECIPE_FALLBACK = 'https://res.cloudinary.com/dojllekyc/image/upload/agromap/recetas/placeholder.jpg'

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(ENDPOINTS.recetas)
      .then(res => res.json())
      .then(json => {
        const data = json.success ? json.data : json
        setRecipes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching recipes:', err)
        setLoading(false)
      })
  }, [])

  const total = useMemo(() => recipes.length, [recipes])

  const handleViewRecipe = (recipe: Recipe) => {
    const ingredients = recipe.ingredients || []
    const steps = recipe.steps || []

    Swal.fire({
      title: `<span style="font-family: 'Outfit', sans-serif; color: #0d2818; font-weight: 700;">${escapeHtml(recipe.title)}</span>`,
      html: `
        <div style="text-align: left; padding: 0 10px; font-family: 'DM Sans', sans-serif;">
          <p style="color: #424843; font-style: italic; margin-bottom: 20px; line-height: 1.5;">${escapeHtml(recipe.description)}</p>

          <div style="margin-bottom: 20px;">
            <h4 style="color: #0d2818; margin-bottom: 12px; border-bottom: 1px solid #e1e8fd; padding-bottom: 6px; font-family: 'Outfit', sans-serif; font-weight: 600;">Ingredientes</h4>
            <ul style="color: #424843; line-height: 1.8; list-style-type: none; padding: 0;">
              ${ingredients.length > 0
                ? ingredients.map(ing => `<li style="display: flex; align-items: center; gap: 8px;"><span style="color: #52b788;">•</span> ${escapeHtml(ing)}</li>`).join('')
                : '<li>No se especificaron ingredientes.</li>'
              }
            </ul>
          </div>

          <div>
            <h4 style="color: #0d2818; margin-bottom: 12px; border-bottom: 1px solid #e1e8fd; padding-bottom: 6px; font-family: 'Outfit', sans-serif; font-weight: 600;">Preparación</h4>
            ${steps.length > 0
              ? `<ol style="color: #424843; line-height: 1.7; padding-left: 20px;">
                  ${steps.map(step => `<li style="margin-bottom: 10px; padding-left: 5px;">${escapeHtml(step)}</li>`).join('')}
                 </ol>`
              : '<p style="color: #727972; font-style: italic;">Próximamente estaremos añadiendo el paso a paso detallado para esta receta.</p>'
            }
          </div>
        </div>
      `,
      confirmButtonText: '¡Entendido!',
      confirmButtonColor: '#52b788',
      showCloseButton: true,
      width: '620px',
      customClass: {
        container: 'swal2-recipe-container'
      }
    })
  }

  if (loading) return <div className="pn-recipes-loading">Cargando recetas saludables...</div>

  return (
    <section id="recetas" className="pn-recipes-page">
      {/* Hero card */}
      <div className="pn-recipes-hero">
        <div className="pn-recipes-hero-overlay" />
        <div className="pn-recipes-hero-content">
          <span className="pn-recipes-hero-pill">
            <ChefHat size={16} strokeWidth={2.2} /> Cocina Saludable
          </span>
          <h1 className="pn-recipes-hero-title">Sabores del Campo en tu Mesa</h1>
          <p className="pn-recipes-hero-subtitle">
            Aprovechá al máximo tus compras en la feria con estas deliciosas recetas
            preparadas con ingredientes frescos de temporada y de origen local.
          </p>
        </div>
      </div>

      {/* Layout 2 columnas */}
      <div className="pn-recipes-layout">
        <aside className="pn-recipes-aside">
          <div className="pn-recipes-aside-card">
            <h3 className="pn-recipes-aside-title">Categorías</h3>
            <div className="pn-recipes-category-row active">
              <span className="pn-recipes-category-label">Todas</span>
              <span className="pn-recipes-category-count">{total}</span>
            </div>
          </div>

          <div className="pn-recipes-tip-card">
            <div className="pn-recipes-tip-icon">
              <ChefHat size={20} strokeWidth={2} />
            </div>
            <h4 className="pn-recipes-tip-title">Tip del Chef</h4>
            <p className="pn-recipes-tip-text">
              Comprar verduras de temporada no solo es más barato, sino que el sabor
              es mucho más intenso y nutritivo.
            </p>
          </div>
        </aside>

        <div className="pn-recipes-grid">
          {(recipes || []).map(recipe => (
            <article key={recipe.id} className="pn-recipe-card">
              <div className="pn-recipe-image-wrap">
                <img
                  src={recipe.image_url || RECIPE_FALLBACK}
                  alt={recipe.title}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = RECIPE_FALLBACK }}
                />
                <span className={`pn-recipe-badge difficulty-${recipe.difficulty?.toLowerCase().replace('í', 'i')}`}>
                  {recipe.difficulty}
                </span>
              </div>

              <div className="pn-recipe-body">
                <div className="pn-recipe-meta">
                  <span><Clock size={14} strokeWidth={2} /> {recipe.time}</span>
                  <span><ShoppingBasket size={14} strokeWidth={2} /> {(recipe.ingredients || []).length} Ingredientes</span>
                </div>
                <h3 className="pn-recipe-title">{recipe.title}</h3>
                <p className="pn-recipe-description">{recipe.description}</p>

                <button
                  className="pn-recipe-btn"
                  onClick={() => handleViewRecipe(recipe)}
                >
                  Ver receta completa <ArrowRight size={16} strokeWidth={2.2} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Recipes
