import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api'
import UserModal from '../../../components/admin/UserModal/UserModal'
import './AdminDashboard.css'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        prices: 0,
        fairs: 0,
        queries: 340 
    })
    const [loading, setLoading] = useState(true)
    const [showUserModal, setShowUserModal] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const [users, products, prices, fairs] = await Promise.all([
                api.getUsers(),
                api.getProducts(),
                api.getPrices(),
                api.getFairs()
            ])
            setStats({
                users: users.length,
                products: products.length,
                prices: prices.length,
                fairs: fairs.length,
                queries: 340
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { title: 'Usuarios registrados', value: loading ? '...' : stats.users, icon: '👥', trend: '+3 esta semana', color: '#6c5ce7', bgColor: '#f3f0ff', path: '/admin/usuarios' },
        { title: 'Ferias activas', value: loading ? '...' : stats.fairs, icon: '🏪', trend: '+2', color: '#00cec9', bgColor: '#e0f9f8', path: '/admin/ferias' },
        { title: 'Productos en catálogo', value: loading ? '...' : stats.products, icon: '🥦', trend: '+8', color: '#00b894', bgColor: '#e6fffb', path: '/admin/productos' },
        { title: 'Consultas realizadas', value: stats.queries, icon: '🔍', trend: 'Hoy', color: '#fab1a0', bgColor: '#fff2ef', path: '/admin' },
    ]

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Administración</h1>
                <div className="header-actions">
                    <button className="btn-new" onClick={() => setShowUserModal(true)}>
                        + Nuevo usuario
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <Link to={card.path} className="stat-card" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="stat-card-top">
                            <div className="card-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                                {card.icon}
                            </div>
                            <span className="trend" style={{ color: '#10b981' }}>{card.trend}</span>
                        </div>
                        <div className="card-content">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <UserModal 
                isOpen={showUserModal} 
                onClose={() => setShowUserModal(false)} 
                onSuccess={() => fetchStats()} 
            />
        </div>
    )
}

export default AdminDashboard
