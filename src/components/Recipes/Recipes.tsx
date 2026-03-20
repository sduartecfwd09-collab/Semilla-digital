import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import './Recipes.css'
import { ENDPOINTS } from '../../services/api.config'

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  difficulty: string
  time: string
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(ENDPOINTS.recetas)
      .then(res => res.json())
      .then(data => {
        setRecipes(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching recipes:', err)
        setLoading(false)
      })
  }, [])

  const handleViewRecipe = (recipe: Recipe) => {
    const ingredients = recipe.ingredients || [];
    const steps = recipe.steps || [];

    Swal.fire({
      title: `<span style="font-family: 'Playfair Display', serif; color: #11361c">${recipe.title}</span>`,
      html: `
        <div style="text-align: left; padding: 0 10px;">
          <p style="color: #666; font-style: italic; margin-bottom: 20px; line-height: 1.5;">${recipe.description}</p>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2d8a42; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 5px;">🥑 Ingredientes:</h4>
            <ul style="color: #444; line-height: 1.8; list-style-type: none; padding: 0;">
              ${ingredients.length > 0 
                ? ingredients.map(ing => `<li style="display: flex; align-items: center; gap: 8px;"><span style="color: #2d8a42;">•</span> ${ing}</li>`).join('')
                : '<li>No se especificaron ingredientes.</li>'
              }
            </ul>
          </div>

          <div>
            <h4 style="color: #2d8a42; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 5px;">👨‍🍳 Preparación:</h4>
            ${steps.length > 0 
              ? `<ol style="color: #444; line-height: 1.7; padding-left: 20px;">
                  ${steps.map(step => `<li style="margin-bottom: 10px; padding-left: 5px;">${step}</li>`).join('')}
                 </ol>`
              : '<p style="color: #888; font-style: italic;">Próximamente estaremos añadiendo el paso a paso detallado para esta receta.</p>'
            }
          </div>
        </div>
      `,
      confirmButtonText: '¡Entendido!',
      confirmButtonColor: '#2d8a42',
      showCloseButton: true,
      width: '600px',
      customClass: {
        container: 'swal2-recipe-container'
      }
    })
  }

  if (loading) return <div className="loading-recipes">Cargando recetas saludables...</div>

  return (
    <section id="recetas" className="recipes-section">
      <div className="section-header">
        <span className="section-tag">🥗 Cocinando con AgroMap</span>
        <h2 className="section-title">Nuestras Recomendaciones</h2>
        <p className="section-desc">
          Aprovechá al máximo tus compras en la feria con estas deliciosas recetas preparadas con ingredientes frescos de temporada.
        </p>
      </div>

      <div className="recipes-grid">
        {(recipes || []).map(recipe => (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-badge">{recipe.difficulty}</div>
            <h3 className="recipe-title">{recipe.title}</h3>
            <p className="recipe-description">{recipe.description}</p>
            
            <div className="recipe-info">
              <span>⏱️ {recipe.time}</span>
              <span>🥕 {(recipe.ingredients || []).length} Ingredientes</span>
            </div>

            <div className="recipe-ingredients-preview">
              {(recipe.ingredients || []).slice(0, 3).join(', ')}...
            </div>

            <button 
              className="recipe-btn"
              onClick={() => handleViewRecipe(recipe)}
            >
              Ver receta completa
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Recipes
