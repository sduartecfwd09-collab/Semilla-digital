import React, { useEffect, useState } from 'react'
// Este componente gestiona la lista de usuarios del sistema
import { api } from '../../../services/api'
import UserModal from '../../../components/admin/UserModal/UserModal'
import Swal from 'sweetalert2'
import { User } from '../../../types'
import './AdminUsuarios.css'

const AdminUsuarios = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await api.getUsers()
            setUsers(data.filter((u: User) => u.role !== 'Administrador'))
        } catch (error) {
            console.error('Error al obtener usuarios:', error)
            Swal.fire('Error', 'No se pudieron cargar los usuarios. Verifica tu conexión.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = async (id: string) => {
        const user = users.find(u => u.id === id)
        if (!user) return;

        const result = await Swal.fire({
            title: '¿Eliminar Usuario?',
            text: `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#718096',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.deleteUser(id)
                setUsers(users.filter(u => u.id !== id))
                Swal.fire('Eliminado', 'El usuario ha sido eliminado correctamente.', 'success')
            } catch (error) {
                Swal.fire('Error', 'Hubo un problema al intentar eliminar al usuario.', 'error')
            }
        }
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        setShowModal(true)
    }

    const handleSuccess = () => {
        fetchUsers()
        closeModal()
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedUser(null)
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getInitials = (name: string) => {
        if (!name) return '??'
        return name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().substring(0, 2)
    }

    return (
        <div className="users-container">
            <header className="users-header">
                <h1>Gestión de Usuarios</h1>
                <button className="btn-new" onClick={() => setShowModal(true)}>
                    <span>+</span> Nuevo Usuario
                </button>
            </header>

            <div className="users-actions">
                <input
                    type="text"
                    placeholder="Buscar usuarios por nombre o correo..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando usuarios...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                         <div className="user-info-cell">
                                             <div className="user-avatar">
                                                 {user.avatar ? (
                                                     <img src={user.avatar} alt={user.name} />
                                                 ) : (
                                                     getInitials(user.name)
                                                 )}
                                             </div>
                                             <div className="user-details">
                                                 <span className="user-name">{user.name}</span>
                                                 <span className="user-email">{user.email}</span>
                                             </div>
                                         </div>
                                     </td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span className={`status-badge ${user.status === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                         <div className="action-buttons">
                                             <button
                                                 className="btn-text btn-edit-pill"
                                                 title="Editar"
                                                 onClick={() => handleEditClick(user)}
                                             >
                                                 <span className="btn-icon-small">✏️</span> Editar
                                             </button>
                                             <button
                                                 className="btn-text btn-delete-pill"
                                                 title="Eliminar"
                                                 onClick={() => handleDeleteClick(user.id)}
                                             >
                                                 <span className="btn-icon-small">🗑️</span> Eliminar
                                             </button>
                                         </div>
                                     </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <UserModal
                    isOpen={showModal}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                    userToEdit={selectedUser}
                />
            )}
        </div>
    )
}

export default AdminUsuarios
