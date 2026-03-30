import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AdminSidebar from '../AdminSidebar'
import Navbar from '../../Navbar'
import Footer from '../../Footer/Footer'
import '../../../admin-ui.css'
import './AdminLayout.css'

// Define la estructura básica de las páginas administrativas
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { pathname } = useLocation()

    // Soluciona el bug de navegación forzando el scroll al inicio en cada cambio de sección
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <div className="admin-page-container">
            <Navbar />
            <div className="admin-layout">
                <AdminSidebar />
                <main className="admin-main">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default AdminLayout
