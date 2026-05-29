import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import Swal from 'sweetalert2'
import './AdminRecetas.css'
import { Recipe } from '../../../types'
import { uploadImage } from '../../../services/cloudinary.service'

// Este componente gestiona las recetas de temporada, permitiendo CRUD (Crear, Leer, Actualizar, Borrar)
const AdminRecetas = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
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
        setImageFile(null)
        setUploadProgress(0)
        setFormData({
            ...recipe,
            time: recipe.time ? recipe.time.replace(' min', '') : '',
            image_url: recipe.image_url || '',
            steps: recipe.steps ? recipe.steps.join('\n') : '',
            ingredients: recipe.ingredients ? recipe.ingredients.join(', ') : ''
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        if (!file) {
            setImageFile(null)
            return
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            e.target.value = ''
            Swal.fire('Archivo no válido', 'Solo se aceptan imágenes JPG, PNG o WebP.', 'warning')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            e.target.value = ''
            Swal.fire('Archivo muy grande', 'La imagen no puede superar los 5MB.', 'warning')
            return
        }

        setImageFile(file)
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
        const form = new FormData(e.currentTarget as HTMLFormElement)
        const title = String(form.get('title') ?? formData.title).trim()
        const description = String(form.get('description') ?? formData.description).trim()
        const ingredientsText = String(form.get('ingredients') ?? formData.ingredients).trim()
        const stepsText = String(form.get('steps') ?? formData.steps).trim()
        const difficulty = String(form.get('difficulty') ?? formData.difficulty).trim()
        const timeText = String(form.get('time') ?? formData.time).trim()

        // Validación: No permitir campos vacíos o que solo contengan espacios
        if (!title || !description || !ingredientsText || !stepsText || !timeText) {
            Swal.fire('Información Faltante', 'Todos los campos son obligatorios. Por favor, evita dejar vacíos.', 'warning')
            return
        }

        try {
            setSaving(true)
            let imageUrl = formData.image_url
            if (imageFile) {
                const uploaded = await uploadImage(imageFile, { folder: 'recetas', onProgress: setUploadProgress })
                imageUrl = uploaded.secureUrl
            }

            const recipeData = {
                title,
                description,
                image_url: imageUrl,
                difficulty,
                time: `${timeText} min`,
                ingredients: ingredientsText.split(',').map(i => i.trim()).filter(i => i !== ''),
                steps: stepsText.split('\n').map(s => s.trim()).filter(s => s !== '')
            }

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
            Swal.fire('Error', error instanceof Error ? error.message : 'Hubo un error al guardar la receta', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Cerrar el modal y resetear el formulario
    const closeModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setSelectedRecipe(null)
        setImageFile(null)
        setUploadProgress(0)
        setFormData({ title: '', description: '', image_url: '', ingredients: '', steps: '', difficulty: 'Fácil', time: '' })
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
                                        <span className="ingredient-tag" key={`${ing}-${i}`}>{ing}</span>
                                    ))}
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
                                            name="title"
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
                                            name="description"
                                            className="form-control"
                                            rows={2}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            style={{ resize: 'none', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e5e7eb', background: '#f9fafb', fontFamily: 'inherit' }}
                                            required
                                        />
                                    </div>
                                    <div className="form-field full-width">
                                        <label>Imagen de la receta</label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                        />
                                        {uploadProgress > 0 && uploadProgress < 100 && <small>Subiendo imagen: {uploadProgress}%</small>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Detalles de Preparación</h3>
                                <div className="form-grid">
                                    <div className="form-field full-width">
                                        <label>Ingredientes (separados por coma)</label>
                                        <input
                                            name="ingredients"
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
                                            name="steps"
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
                                            name="difficulty"
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
                                            name="time"
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
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Receta'}
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

