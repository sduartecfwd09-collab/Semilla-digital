import { NavLink, Link } from 'react-router-dom'
import './AdminSidebar.css'

// Este componente representa la barra lateral de navegación para el panel de administración
const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2>Panel Admin</h2>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    📊 Dashboard
                </NavLink>
                <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    👥 Usuarios
                </NavLink>
                <NavLink to="/admin/ferias" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    🏪 Ferias
                </NavLink>
                <NavLink to="/admin/productos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    📦 Productos
                </NavLink>
                <NavLink to="/admin/precios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    💲 Precios
                </NavLink>
                <NavLink to="/admin/recetas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    🍃 Recetas
                </NavLink>
                <NavLink to="/admin/configuracion" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    ⚙️ Configuración
                </NavLink>
            </nav>

            <button className="logout-btn">
                Cerrar sesión
            </button>
        </aside>
    )
}

export default AdminSidebar
