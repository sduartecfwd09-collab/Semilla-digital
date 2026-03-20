import React, { useEffect, useState } from 'react'
// Este componente gestiona la lista de usuarios del sistema
import { api } from '../../../services/api'
import ConfirmModal from '../../../components/admin/ConfirmModal/ConfirmModal'
import UserModal from '../../../components/admin/UserModal/UserModal'
import AlertModal from '../../../components/admin/AlertModal/AlertModal'
import { User } from '../../../types'
import './AdminUsuarios.css'

const AdminUsuarios = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' | 'warning' })
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await api.getUsers()
            setUsers(data)
        } catch (error) {
            console.error('Error al obtener usuarios:', error)
            setAlertConfig({
                title: 'Error de Conexión',
                message: 'No se pudieron cargar los usuarios. Por favor, verifica tu conexión.',
                type: 'error'
            })
            setShowAlert(true)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (id: string) => {
        const user = users.find(u => u.id === id)
        if (user) {
            setSelectedUser(user)
            setShowConfirm(true)
        }
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        setShowModal(true)
    }

    const handleConfirmDelete = async () => {
        if (selectedUser?.id) {
            try {
                await api.deleteUser(selectedUser.id)
                setUsers(users.filter(u => u.id !== selectedUser.id))
                setShowConfirm(false)
                setSelectedUser(null)
                setAlertConfig({
                    title: 'Usuario Eliminado',
                    message: 'El usuario ha sido eliminado correctamente.',
                    type: 'success'
                })
                setShowAlert(true)
            } catch {
                setAlertConfig({
                    title: 'Error',
                    message: 'Hubo un problema al intentar eliminar al usuario.',
                    type: 'error'
                })
                setShowAlert(true)
            }
        }
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
                                            <div className="user-avatar">{getInitials(user.name)}</div>
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
                                                className="btn-icon btn-edit"
                                                title="Editar"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                title="Eliminar"
                                                onClick={() => handleDeleteClick(user.id)}
                                            >
                                                🗑️
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

            <ConfirmModal
                isOpen={showConfirm}
                title="Eliminar Usuario"
                message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowConfirm(false)}
            />

            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    )
}

export default AdminUsuarios
