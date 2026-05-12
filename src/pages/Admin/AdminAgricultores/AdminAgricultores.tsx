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
            const [users, puestos, allProducts, allFerias] = await Promise.all([
                api.getUsers(),
                api.request<PuestoAgricultor[]>('/puestosAgricultor'),
                api.request<any[]>('/productos'),
                api.request<any[]>('/ferias')
            ])

            // Solo mostrar agricultores aprobados (role === 'Agricultor')
            const agros = users
                .filter((u: User) => u.role === 'Agricultor')
                .map((u: User) => {
                    const puesto = puestos.find(p => p.usuarioId === u.id)
                    const productos = allProducts.filter(p => String(p.userId) === String(u.id))
                    const feria = allFerias.find(f => f.id === u.feriaId)
                    return {
                        ...u,
                        puesto: puesto || null,
                        productosList: productos,
                        feriaDetail: feria || null
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

        const trimmedName = formData.name.trim()
        const trimmedEmail = formData.email.trim()
        const trimmedTelefono = formData.telefono.trim()
        const trimmedNombrePuesto = formData.nombrePuesto.trim()
        const trimmedUbicacion = formData.ubicacion.trim()
        const trimmedHorarios = formData.horarios.trim()

        if (!trimmedName || !trimmedEmail) {
            Swal.fire('Campos obligatorios', 'El nombre y correo son requeridos.', 'warning')
            return
        }

        if (trimmedTelefono && trimmedTelefono.length !== 8) {
            Swal.fire('Teléfono inválido', 'El número de teléfono debe tener exactamente 8 dígitos.', 'warning')
            return
        }

        try {
            let userResult: User;
            let puestoResult: any = null;

            if (isEditing && selectedAgricultor) {
                // Actualizar usuario
                userResult = await api.updateUser(selectedAgricultor.id, {
                    name: trimmedName,
                    email: trimmedEmail
                })

                // Actualizar o crear puesto
                if (selectedAgricultor.puesto) {
                    puestoResult = await api.request(`/puestosAgricultor/${selectedAgricultor.puesto.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            nombrePuesto: trimmedNombrePuesto,
                            ubicacion: trimmedUbicacion,
                            telefono: trimmedTelefono,
                            horarios: trimmedHorarios
                        })
                    })
                } else {
                    puestoResult = await api.request(`/puestosAgricultor`, {
                        method: 'POST',
                        body: JSON.stringify({
                            usuarioId: selectedAgricultor.id,
                            nombrePuesto: trimmedNombrePuesto,
                            ubicacion: trimmedUbicacion,
                            telefono: trimmedTelefono,
                            horarios: trimmedHorarios,
                            fechaRegistro: new Date().toISOString(),
                            tiposProducto: []
                        })
                    })
                }

                setAgricultores(agricultores.map(a => 
                    a.id === selectedAgricultor.id 
                    ? { ...userResult, puesto: puestoResult, productosList: a.productosList, feriaDetail: a.feriaDetail } 
                    : a
                ))
            } else {
                // Crear nuevo agricultor (usuario + puesto)
                userResult = await api.createUser({
                    name: trimmedName,
                    email: trimmedEmail,
                    role: 'Agricultor',
                    status: 'Activo'
                })

                puestoResult = await api.request(`/puestosAgricultor`, {
                    method: 'POST',
                    body: JSON.stringify({
                        usuarioId: userResult.id,
                        nombrePuesto: trimmedNombrePuesto,
                        ubicacion: trimmedUbicacion,
                        telefono: trimmedTelefono,
                        horarios: trimmedHorarios,
                        fechaRegistro: new Date().toISOString(),
                        tiposProducto: []
                    })
                })

                setAgricultores([...agricultores, { ...userResult, puesto: puestoResult, productosList: [], feriaDetail: null }])
            }
            closeModal()
            Swal.fire('Éxito', 'Información guardada correctamente.', 'success')
        } catch (error) {
            console.error('Error al guardar:', error)
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

    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedDetailAgro, setSelectedDetailAgro] = useState<any>(null)

    const handleVerDetalles = (agro: any) => {
        setSelectedDetailAgro(agro)
        setShowDetailsModal(true)
    }

    const handleCloseDetails = () => {
        setShowDetailsModal(false)
        setSelectedDetailAgro(null)
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
                                <p>📞 {agro.puesto?.telefono ? (
                                  <a 
                                    href={`https://wa.me/506${agro.puesto.telefono.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}
                                    title="Abrir WhatsApp"
                                  >
                                    {agro.puesto.telefono} 💬
                                  </a>
                                ) : 'Sin teléfono'}</p>
                            </div>

                            <div className="agro-card-actions">
                                <button className="btn-details" onClick={() => handleVerDetalles(agro)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>👁️ Detalles</button>
                                <button className="btn-edit" onClick={() => handleEditClick(agro)}>Editar</button>
                                <button className="btn-delete" onClick={() => handleDeleteClick(agro)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDetailsModal && selectedDetailAgro && (
                <div className="modal-backdrop" style={{ zIndex: 1000 }}>
                    <div className="admin-modal" style={{ maxWidth: '900px', width: '95%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900 }}>Detalle Integral del Agricultor</h2>
                            <button className="close-btn" onClick={handleCloseDetails}>✕</button>
                        </div>
                        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                                {/* Columna Izquierda: Información del Productor */}
                                <div className="detail-section">
                                    <h3 style={{ color: '#052e16', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ background: '#3B9C3A15', padding: '8px', borderRadius: '10px' }}>👤</span> Perfil de Usuario
                                    </h3>
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ marginBottom: '1rem' }}><strong>Nombre completo:</strong><br/> <span style={{ color: '#334155' }}>{selectedDetailAgro.name}</span></p>
                                        <p style={{ marginBottom: '1rem' }}><strong>Correo electrónico:</strong><br/> <span style={{ color: '#334155' }}>{selectedDetailAgro.email}</span></p>
                                        <p style={{ marginBottom: '1rem' }}><strong>Estado de cuenta:</strong><br/> 
                                            <span style={{ 
                                                background: selectedDetailAgro.status?.toLowerCase() === 'activo' ? '#dcfce7' : '#fee2e2',
                                                color: selectedDetailAgro.status?.toLowerCase() === 'activo' ? '#166534' : '#991b1b',
                                                padding: '2px 10px',
                                                borderRadius: '50px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase'
                                            }}>
                                                {selectedDetailAgro.status || 'Activo'}
                                            </span>
                                        </p>
                                        <p><strong>Fecha de Ingreso:</strong><br/> <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{selectedDetailAgro.puesto?.fechaRegistro ? new Date(selectedDetailAgro.puesto.fechaRegistro).toLocaleDateString() : 'N/A'}</span></p>
                                    </div>

                                    {/* Información de la Feria */}
                                    <h3 style={{ color: '#052e16', fontSize: '1.2rem', fontWeight: 800, margin: '2rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ background: '#3B9C3A15', padding: '8px', borderRadius: '10px' }}>🏟️</span> Sede y Feria
                                    </h3>
                                    <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                                        {selectedDetailAgro.feriaDetail ? (
                                            <>
                                                <p style={{ marginBottom: '1rem' }}><strong>Feria asociada:</strong><br/> <span style={{ color: '#166534', fontWeight: 700 }}>{selectedDetailAgro.feriaDetail.nombre}</span></p>
                                                <p style={{ marginBottom: '1rem' }}><strong>Provincia/Ubicación:</strong><br/> <span style={{ color: '#334155' }}>{selectedDetailAgro.feriaDetail.provincia}, {selectedDetailAgro.feriaDetail.ubicacion}</span></p>
                                                <p><strong>Horarios de feria:</strong><br/> <span style={{ color: '#334155' }}>{selectedDetailAgro.feriaDetail.horario || 'No especificado'}</span></p>
                                            </>
                                        ) : (
                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Este agricultor aún no ha sido vinculado a una feria específica del catálogo.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Columna Derecha: Información del Puesto */}
                                <div className="detail-section">
                                    <h3 style={{ color: '#052e16', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ background: '#3B9C3A15', padding: '8px', borderRadius: '10px' }}>🏪</span> Información del Puesto
                                    </h3>
                                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px' }}>
                                        <p style={{ marginBottom: '1rem' }}><strong>Razón Social / Nombre:</strong><br/> <span style={{ color: '#334155', fontWeight: 700 }}>{selectedDetailAgro.puesto?.nombrePuesto || 'N/A'}</span></p>
                                        <p style={{ marginBottom: '1rem' }}><strong>Descripción del negocio:</strong><br/> <span style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{selectedDetailAgro.puesto?.descripcion || 'Sin descripción.'}</span></p>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                            <p><strong>WhatsApp:</strong><br/> <span style={{ color: '#25D366', fontWeight: 700 }}>{selectedDetailAgro.puesto?.telefono || 'N/A'}</span></p>
                                            <p><strong>Redes:</strong><br/> <span style={{ color: '#3b82f6' }}>{selectedDetailAgro.puesto?.redesSociales || 'No vinculadas'}</span></p>
                                        </div>
                                        
                                        <p style={{ marginTop: '1rem' }}><strong>Métodos de cultivo:</strong><br/> <span style={{ color: '#166534', fontWeight: 500 }}>{selectedDetailAgro.puesto?.metodosCultivo || 'Orgánico / Convencional'}</span></p>
                                    </div>

                                    {/* Imágenes del Puesto */}
                                    <h3 style={{ color: '#052e16', fontSize: '1.2rem', fontWeight: 800, margin: '2rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ background: '#3B9C3A15', padding: '8px', borderRadius: '10px' }}>📸</span> Galería de Imágenes
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                                        {selectedDetailAgro.puesto?.fotosNombres && selectedDetailAgro.puesto.fotosNombres.length > 0 ? (
                                            selectedDetailAgro.puesto.fotosNombres.map((img: string, idx: number) => (
                                                <div key={idx} style={{ 
                                                    aspectRatio: '1/1', 
                                                    borderRadius: '10px', 
                                                    overflow: 'hidden', 
                                                    border: '1px solid #e2e8f0',
                                                    background: '#f1f5f9' 
                                                }}>
                                                    <img 
                                                       src={img.startsWith('data:') ? img : `/uploads/${img}`} 
                                                       alt="Foto puesto" 
                                                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                       onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Puesto' }}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No hay fotos registradas.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fila Inferior: Lista de Productos */}
                            <div className="form-section" style={{ marginTop: '3rem' }}>
                                <h3 style={{ color: '#052e16', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ background: '#3B9C3A15', padding: '8px', borderRadius: '10px' }}>📦</span> Catálogo de Productos ({selectedDetailAgro.productosList?.length || 0})
                                </h3>
                                {selectedDetailAgro.productosList?.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                        {selectedDetailAgro.productosList.map((p: any) => (
                                            <div key={p.id} style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                                <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                                    {p.emoji || '🌿'}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#052e16' }}>{p.nombre}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.categoria}</span>
                                                    {p.precios?.length > 0 && <span style={{ fontSize: '1rem', color: '#166534', fontWeight: 800, marginTop: '2px' }}>₡{p.precios[0].precio}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Este agricultor aún no ha registrado productos en su inventario digital.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', padding: '1.5rem 2rem', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-save" onClick={handleCloseDetails} style={{ padding: '0.75rem 2rem' }}>Entendido</button>
                        </div>
                    </div>
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
                                            type="tel" 
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/[^0-9]/g, '').slice(0, 8)})}
                                            placeholder="88887777"
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
