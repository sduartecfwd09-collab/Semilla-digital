import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api'
import { ENDPOINTS } from '../../../services/api.config'
import UserModal from '../../../components/admin/UserModal/UserModal'
import { normalizeProductName } from '../../../utils/productCatalog'
import './AdminDashboard.css'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        agricultores: 0,
        recipes: 0,
        pendingRequests: 0,
        queries: 340,
        contactos: 0,
        pendingContactos: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const [users, products, recipes] = await Promise.all([
                api.getUsers().catch(() => []),
                api.getProducts().catch(() => []),
                api.request<any[]>('/recetas').catch(() => [])
            ])

            // Obtener solicitudes reales para el contador de pendientes
            let pendingCount = 0;
            try {
                const solRes = await fetch(ENDPOINTS.solicitudesCambioRol);
                if (solRes.ok) {
                    const solicitudes = await solRes.json();
                    pendingCount = solicitudes.filter((s: any) => s.estado === 'Pendiente').length;
                }
            } catch (e) {
                console.warn('Error fetching solicitudes:', e);
            }

            // Obtener contactos para las cards
            let contactosCount = 0;
            let pendingContactosCount = 0;
            try {
                const contactRes = await fetch(ENDPOINTS.contactMessages);
                if (contactRes.ok) {
                    const contactos = await contactRes.json();
                    contactosCount = contactos.length;
                    pendingContactosCount = contactos.filter((c: any) => c.estado === 'Pendiente').length;
                }
            } catch (e) {
                console.warn('Error fetching contactos:', e);
            }

            const agricultoresCount = users.filter((u: any) => u.role === 'Agricultor').length;

            setStats({
                users: users.length,
                products: products.length,
                agricultores: agricultoresCount,
                recipes: recipes.length,
                pendingRequests: pendingCount,
                queries: 340,
                contactos: contactosCount,
                pendingContactos: pendingContactosCount
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { title: 'Usuarios registrados', value: loading ? '...' : stats.users, icon: '👥', trend: '+3 esta semana', color: '#6c5ce7', bgColor: '#f3f0ff', path: '/admin/usuarios' },
        { title: 'Solicitudes pendientes', value: loading ? '...' : stats.pendingRequests, icon: '📝', trend: 'Revisión', color: '#fa8231', bgColor: '#fff4e6', path: '/admin/solicitudes' },
        { title: 'Agricultores activos', value: loading ? '...' : stats.agricultores, icon: '👨‍🌾', trend: '+2', color: '#00cec9', bgColor: '#e0f9f8', path: '/admin/agricultores' },
        { title: 'Productos en catálogo', value: loading ? '...' : stats.products, icon: '🥦', trend: '+8', color: '#00b894', bgColor: '#e6fffb', path: '/admin/productos' },
        { title: 'Recetas publicadas', value: loading ? '...' : stats.recipes, icon: '🍃', trend: '+5', color: '#ff9f43', bgColor: '#fff8e1', path: '/admin/recetas' },
        { title: 'Mensajes de contacto', value: loading ? '...' : stats.contactos, icon: '✉️', trend: stats.pendingContactos > 0 ? `${stats.pendingContactos} pendientes` : 'Al día', color: '#e84393', bgColor: '#ffeef8', path: '/admin/contactos' },
    ]

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>AgroMap Admin</h1>
                <p>Bienvenido al Centro de Control de Semilla Digital</p>
            </header>

            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <Link to={card.path} className="stat-card" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="stat-card-top">
                            <div className="card-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                                {card.icon}
                            </div>
                        </div>
                        <span className="trend">{card.trend}</span>
                        <div className="card-content">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default AdminDashboard
