import { NavLink, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import './AdminSidebar.css'

// Este componente representa la barra lateral de navegación para el panel de administración
const AdminSidebar = () => {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir del panel administrativo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3B9C3A',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                logout()
            }
        })
    }

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-profile">
                <div className="profile-img-container">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="sidebar-avatar-img" />
                    ) : (
                        <div className="sidebar-avatar-placeholder">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <span className="profile-name">{user?.name || 'Administrador'}</span>
                    <span className="profile-role">{user?.role || 'Admin'}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-label">Administra</div>
                <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    📊 Dashboard
                </NavLink>
                <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    👥 Usuarios
                </NavLink>
                <NavLink to="/admin/solicitudes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    📝 Solicitudes
                </NavLink>
                <NavLink to="/admin/agricultores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    👨‍🌾 Agricultores
                </NavLink>
                <NavLink to="/admin/productos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    📦 Productos
                </NavLink>
                <NavLink to="/admin/recetas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    🍃 Recetas
                </NavLink>
                <NavLink to="/admin/contactos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    ✉️ Contactos
                </NavLink>
            </nav>
        </aside>
    )
}

export default AdminSidebar
