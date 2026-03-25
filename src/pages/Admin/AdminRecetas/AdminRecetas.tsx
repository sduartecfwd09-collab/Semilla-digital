import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import Swal from 'sweetalert2'
import './AdminRecetas.css'
import { Recipe } from '../../../types'

// Este componente gestiona las recetas de temporada, permitiendo CRUD (Crear, Leer, Actualizar, Borrar)
const AdminRecetas = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
        steps: '',
        difficulty: 'Fácil',
        time: ''
    })

    // Cargar recetas al montar el componente
    useEffect(() => {
        fetchRecipes()
    }, [])

    // Obtener todas las recetas de la API
    const fetchRecipes = async () => {
        try {
            setLoading(true)
            const data = await api.request<any[]>('/recetas')
            setRecipes(data)
        } catch (error) {
            console.error('Error al obtener recetas:', error)
        } finally {
            setLoading(false)
        }
    }

    // Preparar el modal para editar una receta existente
    const handleEditClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe)
        setFormData({
            ...recipe,
            time: recipe.time ? recipe.time.replace(' min', '') : '',
            steps: recipe.steps ? recipe.steps.join('\n') : '',
            ingredients: recipe.ingredients ? recipe.ingredients.join(', ') : ''
        })
        setIsEditing(true)
        setShowModal(true)
    }

    // Mostrar confirmación para eliminar una receta
    const handleDeleteClick = async (recipe: any) => {
        const result = await Swal.fire({
            title: '¿Eliminar Receta?',
            text: `¿Estás seguro de que deseas eliminar la receta "${recipe.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#718096',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        
        if (result.isConfirmed) {
            try {
                await api.request(`/recetas/${recipe.id}`, { method: 'DELETE' })
                setRecipes(prev => prev.filter(r => r.id !== recipe.id))
                Swal.fire('Eliminada', 'La receta fue borrada con éxito.', 'success')
            } catch (error) {
                console.error('Error al eliminar:', error)
                Swal.fire('Error', 'No se pudo eliminar la receta.', 'error')
            }
        }
    }

    // Procesar el envío del formulario (crear o editar)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validación: No permitir campos vacíos o que solo contengan espacios
        if (!formData.title.trim() || !formData.description.trim() || !formData.ingredients.trim() || !formData.steps.trim() || !formData.time.trim()) {
            Swal.fire('Información Faltante', 'Todos los campos son obligatorios. Por favor, evita dejar vacíos.', 'warning')
            return
        }

        const recipeData = {
            ...formData,
            time: `${formData.time} min`, // Siempre guardar con ' min'
            ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i !== ''),
            steps: formData.steps.split('\n').map(s => s.trim()).filter(s => s !== '')
        }

        try {
            if (isEditing && selectedRecipe) {
                const updated = await api.request<any>(`/recetas/${selectedRecipe.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(recipeData)
                })
                setRecipes(recipes.map(r => r.id === selectedRecipe.id ? updated : r))
            } else {
                const created = await api.request<any>('/recetas', {
                    method: 'POST',
                    body: JSON.stringify(recipeData)
                })
                setRecipes([...recipes, created])
            }
            closeModal()
            Swal.fire('Éxito', `Receta ${isEditing ? 'actualizada' : 'creada'} correctamente.`, 'success')
        } catch (error) {
            console.error(error)
            Swal.fire('Error', 'Hubo un error al guardar la receta', 'error')
        }
    }

    // Cerrar el modal y resetear el formulario
    const closeModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setSelectedRecipe(null)
        setFormData({ title: '', description: '', ingredients: '', steps: '', difficulty: 'Fácil', time: '' })
    }

    return (
        <div className="recipes-container">
            <header className="recipes-header">
                <h1>Recetas de Temporada</h1>
                <button className="btn-new" onClick={() => setShowModal(true)}>
                    <span>+</span> Nueva Receta
                </button>
            </header>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando recetas...</div>
            ) : (
                <div className="recipes-grid">
                    {recipes.map(recipe => (
                        <div className="recipe-card" key={recipe.id}>
                            <div className="recipe-card-content">
                                <div className="recipe-meta">
                                    <span>⏱️ {recipe.time}</span>
                                    <span>📊 {recipe.difficulty}</span>
                                </div>
                                <h3>{recipe.title}</h3>
                                <p>{recipe.description}</p>
                                <div className="recipe-ingredients">
                                    {recipe.ingredients && recipe.ingredients.map((ing: string, i: number) => (
                                        <span className="ingredient-tag" key={i}>{ing}</span>
                                    ))}
                                </div>
                                <div className="recipe-steps" style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#4b5563', maxHeight: '100px', overflowY: 'auto' }}>
                                    <strong>Paso a paso:</strong>
                                    <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                                        {recipe.steps && recipe.steps.map((step: string, i: number) => (
                                            <li key={i} style={{ marginBottom: '0.25rem' }}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                                <div className="recipe-card-actions">
                                    <button className="btn-recipe-action btn-edit-recipe" onClick={() => handleEditClick(recipe)}>
                                        <span>✏️</span> Editar
                                    </button>
                                    <button className="btn-recipe-action btn-delete-recipe" onClick={() => handleDeleteClick(recipe)}>
                                        <span>🗑️</span> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-backdrop">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Receta' : 'Nueva Receta'}</h2>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-section">
                                <h3>Información Básica</h3>
                                <div className="form-grid">
                                    <div className="form-field full-width">
                                        <label>Título de la Receta</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ej: Ensalada de Temporada"
                                            required
                                        />
                                    </div>
                                    <div className="form-field full-width">
                                        <label>Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            style={{ resize: 'none', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e5e7eb', background: '#f9fafb', fontFamily: 'inherit' }}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Detalles de Preparación</h3>
                                <div className="form-grid">
                                    <div className="form-field full-width">
                                        <label>Ingredientes (separados por coma)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Tomate, Albahaca, Aceite"
                                            value={formData.ingredients}
                                            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-field full-width">
                                        <label>Paso a paso (un paso por línea)</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            placeholder="Paso 1...&#10;Paso 2..."
                                            value={formData.steps}
                                            onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                                            style={{ resize: 'vertical', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e5e7eb', background: '#f9fafb', fontFamily: 'inherit' }}
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Dificultad</label>
                                        <select
                                            className="form-control"
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            style={{ borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e5e7eb', background: '#f9fafb', appearance: 'none' }}
                                        >
                                            <option value="Fácil">Fácil</option>
                                            <option value="Media">Media</option>
                                            <option value="Difícil">Difícil</option>
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Tiempo (Minutos)</label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 20"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-save">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Receta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminRecetas
