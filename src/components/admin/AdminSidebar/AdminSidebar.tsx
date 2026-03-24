import { NavLink, Link } from 'react-router-dom'
import './AdminSidebar.css'

// Este componente representa la barra lateral de navegación para el panel de administración
const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <nav className="sidebar-nav">
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
            </nav>
        </aside>
    )
}

export default AdminSidebar
