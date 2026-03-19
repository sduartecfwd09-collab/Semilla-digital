import React from 'react'
import AdminSidebar from '../AdminSidebar'
import './AdminLayout.css'

// Define la estructura básica de las páginas administrativas
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                {children}
            </main>
        </div>
    )
}

export default AdminLayout
