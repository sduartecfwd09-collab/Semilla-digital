import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api'
import { ENDPOINTS, authFetch } from '../../../services/api.config'
import UserModal from '../../../components/admin/UserModal/UserModal'
import { normalizeProductName } from '../../../utils/productCatalog'
<<<<<<< HEAD
import adminBg from '../../../assets/admin/admin-bg.png'
import bgPattern from '../../../assets/admin/bg-pattern.png'
import farmerPortrait from '../../../assets/admin/farmer-portrait.png'
=======
import Carousel from '../../../components/Carousel'
>>>>>>> f5e3bfe5da07b0797f4bc1c01256d2a2bd6fb200
import './AdminDashboard.css'

const dashboardSlides = [
    {
        image: adminBg,
        tag: 'Control operativo',
        title: 'Gestión centralizada de AgroMap',
        description: 'Monitoreá usuarios, productores, solicitudes y contenido desde un solo panel.'
    },
    {
        image: farmerPortrait,
        tag: 'Productores',
        title: 'Seguimiento de productores activos',
        description: 'Revisá perfiles, solicitudes y estado administrativo de la red agrícola.'
    },
    {
        image: bgPattern,
        tag: 'Contenido',
        title: 'Catálogo, recetas y mensajes al día',
        description: 'Mantené actualizada la información visible para usuarios y visitantes.'
    }
]

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        productores: 0,
        recipes: 0,
        pendingRequests: 0,
        queries: 340,
        contactos: 0,
        pendingContactos: 0
    })
    const [loading, setLoading] = useState(true)
    const [activeSlide, setActiveSlide] = useState(0)

    useEffect(() => {
        fetchStats()
    }, [])

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % dashboardSlides.length)
        }, 5000)

        return () => window.clearInterval(timer)
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const [usersRaw, productsRaw, recipesRaw] = await Promise.all([
                api.getUsers().catch(() => ({ data: [] })),
                api.getProducts().catch(() => ({ data: [] })),
                api.request<any>('/recetas').catch(() => ({ data: [] }))
            ]) as any[]

            const users = usersRaw.data ?? usersRaw ?? []
            const products = productsRaw.data ?? productsRaw ?? []
            const recipes = recipesRaw.data ?? recipesRaw ?? []

            // Helper: el backend responde como { success, data: [...] }; lo desempaquetamos.
            const unwrap = (json: any) =>
                (json && json.success && Array.isArray(json.data)) ? json.data
                : (Array.isArray(json) ? json : []);

            // Obtener solicitudes reales para el contador de pendientes
            let pendingCount = 0;
            try {
                const solRes = await authFetch(ENDPOINTS.solicitudesCambioRol);
                if (solRes.ok) {
                    const solicitudes = unwrap(await solRes.json());
                    pendingCount = solicitudes.filter((s: any) => s.estado === 'Pendiente').length;
                }
            } catch (e) {
                console.warn('Error fetching solicitudes:', e);
            }

            // Obtener contactos para las cards
            let contactosCount = 0;
            let pendingContactosCount = 0;
            try {
                const contactRes = await authFetch(ENDPOINTS.contactMessages);
                if (contactRes.ok) {
                    const contactos = unwrap(await contactRes.json());
                    contactosCount = contactos.length;
                    pendingContactosCount = contactos.filter((c: any) => c.estado === 'Pendiente').length;
                }
            } catch (e) {
                console.warn('Error fetching contactos:', e);
            }

            const productoresCount = users.filter((u: any) => (u.role ?? u.rol?.nombre) === 'Productor').length;

            setStats({
                users: users.length,
                products: products.length,
                productores: productoresCount,
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
        { title: 'Productores activos', value: loading ? '...' : stats.productores, icon: '👨‍🌾', trend: '+2', color: '#00cec9', bgColor: '#e0f9f8', path: '/admin/productores' },
        { title: 'Productos en catálogo', value: loading ? '...' : stats.products, icon: '🥦', trend: '+8', color: '#00b894', bgColor: '#e6fffb', path: '/admin/productos' },
        { title: 'Recetas publicadas', value: loading ? '...' : stats.recipes, icon: '🍃', trend: '+5', color: '#ff9f43', bgColor: '#fff8e1', path: '/admin/recetas' },
        { title: 'Mensajes de contacto', value: loading ? '...' : stats.contactos, icon: '✉️', trend: stats.pendingContactos > 0 ? `${stats.pendingContactos} pendientes` : 'Al día', color: '#e84393', bgColor: '#ffeef8', path: '/admin/contactos' },
    ]

    const activeDashboardSlide = dashboardSlides[activeSlide]

    return (
<<<<<<< HEAD
        <div className="admin-dashboard-page">
            <header className="admin-dashboard-header">
=======
        <div className="dashboard-container">
            <Carousel variant="compact" />

            <header className="dashboard-header" style={{ marginBottom: '1.5rem', paddingTop: '0' }}>
>>>>>>> f5e3bfe5da07b0797f4bc1c01256d2a2bd6fb200
                <h1>AgroMap Admin</h1>
                <p>Bienvenido al Centro de Control de AgroMap</p>
            </header>

            <section className="admin-dashboard-carousel" aria-label="Resumen del panel administrativo">
                <img src={activeDashboardSlide.image} alt="" className="admin-dashboard-carousel-image" />
                <div className="admin-dashboard-carousel-overlay" />
                <div className="admin-dashboard-carousel-content">
                    <span>{activeDashboardSlide.tag}</span>
                    <h2>{activeDashboardSlide.title}</h2>
                    <p>{activeDashboardSlide.description}</p>
                </div>
                <div className="admin-dashboard-carousel-dots" aria-label="Controles del carrusel">
                    {dashboardSlides.map((slide, index) => (
                        <button
                            key={slide.title}
                            type="button"
                            className={index === activeSlide ? 'active' : ''}
                            aria-label={`Ver ${slide.title}`}
                            onClick={() => setActiveSlide(index)}
                        />
                    ))}
                </div>
            </section>

            <div className="admin-dashboard-stats-grid">
                {statCards.map((card) => (
                    <Link to={card.path} className="admin-dashboard-stat-card" key={card.title}>
                        <div className="admin-dashboard-stat-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                                {card.icon}
                        </div>
                        <span className="admin-dashboard-stat-trend">{card.trend}</span>
                        <div className="admin-dashboard-stat-content">
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
