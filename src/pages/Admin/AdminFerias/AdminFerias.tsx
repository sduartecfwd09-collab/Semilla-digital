import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import ConfirmModal from '../../../components/admin/ConfirmModal/ConfirmModal'
import AlertModal from '../../../components/admin/AlertModal/AlertModal'
import './AdminFerias.css'

const AdminFerias = () => {
    const [fairs, setFairs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [provinceFilter, setProvinceFilter] = useState('Todas')
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedFeria, setSelectedFeria] = useState<any>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', province: 'San José', location: '', schedule: '' })
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '' })

    const provinces = ["Todas", "San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"]

    useEffect(() => {
        fetchFairs()
    }, [])

    const fetchFairs = async () => {
        try {
            setLoading(true)
            const data = await api.request('/fairs')
            setFairs(data)
        } catch (error) {
            console.error('Error fetching fairs:', error)
            setAlertConfig({ isOpen: true, message: 'Error al cargar las ferias.' })
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (feria: any) => {
        setFormData({ ...feria })
        setIsEditing(true)
        setSelectedFeria(feria)
        setShowModal(true)
    }

    const handleDeleteClick = (feria: any) => {
        setSelectedFeria(feria)
        setIsConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedFeria) return
        try {
            await api.request(`/fairs/${selectedFeria.id}`, { method: 'DELETE' })
            setFairs(fairs.filter(f => f.id !== selectedFeria.id))
            setIsConfirmOpen(false)
        } catch (error) {
            setAlertConfig({ isOpen: true, message: 'Error al eliminar feria' })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validación: No permitir campos vacíos o que solo contengan espacios
        if (!formData.name.trim() || !formData.location.trim() || !formData.schedule.trim()) {
            setAlertConfig({
                isOpen: true,
                message: 'Por favor, completa todos los campos requeridos y evita dejar solo espacios en blanco.'
            })
            return
        }

        try {
            if (isEditing && selectedFeria) {
                const updated = await api.request(`/fairs/${selectedFeria.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                })
                setFairs(fairs.map(f => f.id === selectedFeria.id ? updated : f))
            } else {
                const created = await api.request('/fairs', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                })
                setFairs([...fairs, created])
            }
            closeModal()
        } catch (error) {
            setAlertConfig({ isOpen: true, message: 'Error al guardar feria' })
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setSelectedFeria(null)
        setFormData({ name: '', province: 'San José', location: '', schedule: '' })
    }

    const filteredFairs = fairs.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.location.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesProvince = provinceFilter === "Todas" || f.province === provinceFilter
        return matchesSearch && matchesProvince
    })

    return (
        <div className="ferias-container">
            <header className="ferias-header">
                <h1>Ferias de Costa Rica</h1>
                <button className="btn-new" onClick={() => setShowModal(true)}>
                    <span>+</span> Nueva Feria
                </button>
            </header>

            <div className="ferias-controls">
                <input
                    type="text"
                    placeholder="Buscar feria o ubicación..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="province-filter"
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                >
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando ferias...</div>
            ) : (
                <div className="ferias-grid">
                    {filteredFairs.map(feria => (
                        <div className="feria-card" key={feria.id}>
                            <span className="feria-province-badge">{feria.province}</span>
                            <h3>{feria.name}</h3>
                            <div className="feria-info-item">
                                📍 {feria.location}
                            </div>
                            <div className="feria-info-item">
                                ⏰ {feria.schedule}
                            </div>
                            <div className="feria-actions">
                                <button className="btn-icon" onClick={() => handleEditClick(feria)}>✏️</button>
                                <button className="btn-icon" onClick={() => handleDeleteClick(feria)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Feria' : 'Nueva Feria'}</h2>
                            <button className="btn-icon" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre de la Feria</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Provincia</label>
                                <select
                                    className="form-control"
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                >
                                    {provinces.filter(p => p !== "Todas").map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ubicación Exacta</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Horario y Días</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Sábados, 5:00 AM - 1:00 PM"
                                    value={formData.schedule}
                                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Feria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar Feria"
                message={`¿Estás seguro de que deseas eliminar la ${selectedFeria?.name}?`}
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsConfirmOpen(false)}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                title="Información Faltante"
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            />
        </div>
    )
}

export default AdminFerias
