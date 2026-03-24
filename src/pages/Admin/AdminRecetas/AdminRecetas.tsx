import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import ConfirmModal from '../../../components/admin/ConfirmModal/ConfirmModal'
import AlertModal from '../../../components/admin/AlertModal/AlertModal'
import './AdminRecetas.css'

// Este componente gestiona las recetas de temporada, permitiendo CRUD (Crear, Leer, Actualizar, Borrar)
const AdminRecetas = () => {
    const [recipes, setRecipes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', title: '' })
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
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
            const data = await api.request('/recipes')
            setRecipes(data)
        } catch (error) {
            console.error('Error al obtener recetas:', error)
        } finally {
            setLoading(false)
        }
    }

    // Preparar el modal para editar una receta existente
    const handleEditClick = (recipe: any) => {
        setSelectedRecipe(recipe)
        setFormData({
            ...recipe,
            ingredients: recipe.ingredients.join(', ')
        })
        setIsEditing(true)
        setShowModal(true)
    }

    // Mostrar confirmación para eliminar una receta
    const handleDeleteClick = (recipe: any) => {
        setSelectedRecipe(recipe)
        setShowConfirm(true)
    }

    // Ejecutar la eliminación de la receta tras confirmar
    const handleConfirmDelete = async () => {
        if (!selectedRecipe) return
        try {
            await api.request(`/recipes/${selectedRecipe.id}`, { method: 'DELETE' })
            setRecipes(recipes.filter(r => r.id !== selectedRecipe.id))
            setShowConfirm(false)
        } catch (error) {
            setAlertConfig({ isOpen: true, message: 'Error al eliminar receta', title: 'Error' })
        }
    }

    // Procesar el envío del formulario (crear o editar)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validación: No permitir campos vacíos o que solo contengan espacios
        if (!formData.title.trim() || !formData.description.trim() || !formData.ingredients.trim() || !formData.time.trim()) {
            setAlertConfig({
                isOpen: true,
                message: 'Todos los campos son obligatorios. Por favor, evita dejar solo espacios en blanco.',
                title: 'Información Faltante'
            })
            return
        }

        const recipeData = {
            ...formData,
            ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i !== '')
        }

        try {
            if (isEditing && selectedRecipe) {
                const updated = await api.request(`/recipes/${selectedRecipe.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(recipeData)
                })
                setRecipes(recipes.map(r => r.id === selectedRecipe.id ? updated : r))
            } else {
                const created = await api.request('/recipes', {
                    method: 'POST',
                    body: JSON.stringify(recipeData)
                })
                setRecipes([...recipes, created])
            }
            closeModal()
        } catch (error) {
            setAlertConfig({ isOpen: true, message: 'Error al guardar la receta', title: 'Error' })
        }
    }

    // Cerrar el modal y resetear el formulario
    const closeModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setSelectedRecipe(null)
        setFormData({ title: '', description: '', ingredients: '', difficulty: 'Fácil', time: '' })
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
                                    {recipe.ingredients.map((ing: string, i: number) => (
                                        <span className="ingredient-tag" key={i}>{ing}</span>
                                    ))}
                                </div>
                                <div className="price-actions" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <button className="btn-icon" onClick={() => handleEditClick(recipe)}>✏️</button>
                                    <button className="btn-icon" onClick={() => handleDeleteClick(recipe)}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Receta' : 'Nueva Receta'}</h2>
                            <button className="btn-icon" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Título de la Receta</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ resize: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ingredientes (separados por coma)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Tomate, Albahaca, Aceite"
                                    value={formData.ingredients}
                                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                                />
                            </div>
                            <div className="config-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Dificultad</label>
                                    <select
                                        className="form-control"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="Fácil">Fácil</option>
                                        <option value="Media">Media</option>
                                        <option value="Difícil">Difícil</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tiempo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: 20 min"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Receta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showConfirm}
                title="Eliminar Receta"
                message={`¿Estás seguro de que deseas eliminar la receta "${selectedRecipe?.title}"?`}
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowConfirm(false)}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            />
        </div>
    )
}

export default AdminRecetas
