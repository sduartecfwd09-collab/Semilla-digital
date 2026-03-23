import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import Swal from 'sweetalert2'
import { User, PuestoAgricultor } from '../../../types'
import './AdminAgricultores.css'

const AdminAgricultores = () => {
    const [agricultores, setAgricultores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedAgricultor, setSelectedAgricultor] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nombrePuesto: '',
        ubicacion: '',
        telefono: '',
        horarios: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [users, puestos] = await Promise.all([
                api.getUsers(),
                api.request<PuestoAgricultor[]>('/puestosAgricultor')
            ])

            // Solo mostrar agricultores aprobados (role === 'Agricultor')
            const agros = users
                .filter((u: User) => u.role === 'Agricultor')
                .map((u: User) => {
                    const puesto = puestos.find(p => p.usuarioId === u.id)
                    return {
                        ...u,
                        puesto: puesto || null
                    }
                })

            setAgricultores(agros)
        } catch (error) {
            console.error('Error fetching data:', error)
            Swal.fire('Error', 'No se pudieron cargar los datos de los agricultores.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (agro: any) => {
        setFormData({
            name: agro.name,
            email: agro.email,
            nombrePuesto: agro.puesto?.nombrePuesto || '',
            ubicacion: agro.puesto?.ubicacion || '',
            telefono: agro.puesto?.telefono || '',
            horarios: agro.puesto?.horarios || ''
        })
        setIsEditing(true)
        setSelectedAgricultor(agro)
        setShowModal(true)
    }

    const handleDeleteClick = async (agro: any) => {
        const result = await Swal.fire({
            title: '¿Eliminar Agricultor?',
            text: `¿Estás seguro de que deseas eliminar a ${agro.name}? Esta acción también eliminará su puesto registrado y no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar permanentemente',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                // Eliminar usuario
                await api.deleteUser(agro.id)
                
                // Eliminar puesto si existe
                if (agro.puesto) {
                    await api.request(`/puestosAgricultor/${agro.puesto.id}`, { method: 'DELETE' })
                }

                setAgricultores(agricultores.filter(a => a.id !== agro.id))
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El agricultor y su información asociada han sido borrados.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error al eliminar:', error)
                Swal.fire('Error', 'No se pudo completar la eliminación.', 'error')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.email.trim()) {
            Swal.fire('Campos obligatorios', 'El nombre y correo son requeridos.', 'warning')
            return
        }

        try {
            if (isEditing && selectedAgricultor) {
                // Actualizar usuario
                const updatedUser: User = await api.updateUser(selectedAgricultor.id, {
                    name: formData.name,
                    email: formData.email
                })

                // Actualizar o crear puesto
                let updatedPuesto = null
                if (selectedAgricultor.puesto) {
                    updatedPuesto = await api.request(`/puestosAgricultor/${selectedAgricultor.puesto.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            nombrePuesto: formData.nombrePuesto,
                            ubicacion: formData.ubicacion,
                            telefono: formData.telefono,
                            horarios: formData.horarios
                        })
                    })
                } else {
                    updatedPuesto = await api.request(`/puestosAgricultor`, {
                        method: 'POST',
                        body: JSON.stringify({
                            usuarioId: selectedAgricultor.id,
                            nombrePuesto: formData.nombrePuesto,
                            ubicacion: formData.ubicacion,
                            telefono: formData.telefono,
                            horarios: formData.horarios,
                            fechaRegistro: new Date().toISOString(),
                            tiposProducto: []
                        })
                    })
                }

                setAgricultores(agricultores.map(a => 
                    a.id === selectedAgricultor.id 
                    ? { ...updatedUser, puesto: updatedPuesto } 
                    : a
                ))
            } else {
                // Crear nuevo agricultor (usuario + puesto)
                const newUser: User = await api.createUser({
                    name: formData.name,
                    email: formData.email,
                    role: 'Agricultor',
                    status: 'Activo'
                })

                const newPuesto = await api.request(`/puestosAgricultor`, {
                    method: 'POST',
                    body: JSON.stringify({
                        usuarioId: newUser.id,
                        nombrePuesto: formData.nombrePuesto,
                        ubicacion: formData.ubicacion,
                        telefono: formData.telefono,
                        horarios: formData.horarios,
                        fechaRegistro: new Date().toISOString(),
                        tiposProducto: []
                    })
                })

                setAgricultores([...agricultores, { ...newUser, puesto: newPuesto }])
            }
            closeModal()
            Swal.fire('Éxito', 'Información guardada correctamente.', 'success')
        } catch (error) {
            Swal.fire('Error', 'Error al guardar la información.', 'error')
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setSelectedAgricultor(null)
        setFormData({
            name: '',
            email: '',
            nombrePuesto: '',
            ubicacion: '',
            telefono: '',
            horarios: ''
        })
    }

    const filteredAgricultores = agricultores.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.puesto?.nombrePuesto.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="agricultores-page">
            <header className="page-header">
                <div className="header-info">
                    <h1>Mantenimiento de Agricultores</h1>
                    <p>Gestiona la información de los productores y sus puestos de venta</p>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <span>+</span> Nuevo Agricultor
                </button>
            </header>

            <div className="filters-bar">
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o puesto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-control"
                />
            </div>

            {loading ? (
                <div className="loading-state">Cargando agricultores...</div>
            ) : (
                <div className="agricultores-grid">
                    {filteredAgricultores.map(agro => (
                        <div className="agro-card" key={agro.id}>
                            <div className="agro-card-header">
                                <div className="agro-avatar">
                                    {agro.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="agro-main-info">
                                    <h3>{agro.name}</h3>
                                    <span>{agro.email}</span>
                                </div>
                            </div>
                            
                            <div className="agro-puesto-info">
                                <p className="puesto-title">
                                    🏪 {agro.puesto?.nombrePuesto || 'Sin puesto registrado'}
                                </p>
                                <p>📍 {agro.puesto?.ubicacion || 'Ubicación no disponible'}</p>
                                <p>📞 {agro.puesto?.telefono || 'Sin teléfono'}</p>
                                <p>⏰ {agro.puesto?.horarios || 'Horario no definido'}</p>
                            </div>

                            <div className="agro-card-actions">
                                <button className="btn-edit" onClick={() => handleEditClick(agro)}>Editar</button>
                                <button className="btn-delete" onClick={() => handleDeleteClick(agro)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-backdrop">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Agricultor' : 'Registrar Agricultor'}</h2>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-section">
                                <h3>Información Personal</h3>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Correo Electrónico</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Información del Puesto</h3>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Nombre del Puesto</label>
                                        <input 
                                            type="text" 
                                            value={formData.nombrePuesto}
                                            onChange={(e) => setFormData({...formData, nombrePuesto: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Teléfono</label>
                                        <input 
                                            type="text" 
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-field full-width">
                                        <label>Ubicación</label>
                                        <input 
                                            type="text" 
                                            value={formData.ubicacion}
                                            onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-field full-width">
                                        <label>Horarios y Días</label>
                                        <input 
                                            type="text" 
                                            value={formData.horarios}
                                            onChange={(e) => setFormData({...formData, horarios: e.target.value})}
                                            placeholder="Ej: Sábados de 5am a 2pm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-save">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default AdminAgricultores
