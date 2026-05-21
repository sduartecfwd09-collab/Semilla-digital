import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import Swal from 'sweetalert2'
import './AdminFerias.css'
import { Fair } from '../../../types'

const AdminFerias = () => {
    const [fairs, setFairs] = useState<Fair[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [provinceFilter, setProvinceFilter] = useState('Todas')
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedFeria, setSelectedFeria] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', province: 'San José', location: '', schedule: '' })

    const provinces = ["Todas", "San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"]

    useEffect(() => {
        fetchFairs()
    }, [])

    const fetchFairs = async () => {
        try {
            setLoading(true)
            const data: any = await api.request('/ferias')
            setFairs(data)
        } catch (error) {
            console.error('Error fetching fairs:', error)
            Swal.fire('Error', 'Error al cargar las ferias.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (feria: Fair) => {
        setFormData({ ...feria })
        setIsEditing(true)
        setSelectedFeria(feria)
        setShowModal(true)
    }

    const handleDeleteClick = async (feria: any) => {
        const result = await Swal.fire({
            title: 'Eliminar Feria',
            text: `¿Estás seguro de que deseas eliminar la ${feria.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#718096',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.request(`/ferias/${feria.id}`, { method: 'DELETE' })
                setFairs(fairs.filter(f => f.id !== feria.id))
                Swal.fire('Eliminada', 'La feria ha sido eliminada.', 'success')
            } catch (error) {
                Swal.fire('Error', 'Error al eliminar feria', 'error')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.location.trim() || !formData.schedule.trim()) {
            Swal.fire('Información Faltante', 'Completa todos los campos requeridos.', 'warning')
            return
        }

        try {
            if (isEditing && selectedFeria) {
                const updated: any = await api.request(`/ferias/${selectedFeria.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                })
                setFairs(fairs.map(f => f.id === selectedFeria.id ? updated : f))
            } else {
                const created: any = await api.request('/ferias', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                })
                setFairs([...fairs, created])
            }
            closeModal()
            Swal.fire('Éxito', `Feria ${isEditing ? 'actualizada' : 'creada'} correctamente.`, 'success')
        } catch (error) {
            Swal.fire('Error', 'Error al guardar feria', 'error')
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
                                <button
                                    className="btn-text"
                                    onClick={() => handleEditClick(feria)}
                                    style={{ backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn-text"
                                    onClick={() => handleDeleteClick(feria)}
                                    style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                >
                                    Eliminar
                                </button>
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
        </div>
    )
}

export default AdminFerias
