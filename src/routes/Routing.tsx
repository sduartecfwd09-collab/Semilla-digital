import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'

// Páginas públicas
import Home from '../pages/Home'
import Comparar from '../pages/Comparar'
import LoginYRegistroPage from '../pages/LoginYRegistro'
import Profile from '../pages/Profile'
import FeriasPage from '../pages/Ferias'
import RecetasPage from '../pages/Recetas'
import RegistroAgricultorPage from '../pages/RegistroAgricultor'

// Páginas de Administración
import AdminDashboard from '../pages/Admin/AdminDashboard'
import AdminUsuarios from '../pages/Admin/AdminUsuarios'
import AdminFerias from '../pages/Admin/AdminFerias'
import AdminProductos from '../pages/Admin/AdminProductos'
import AdminPrecios from '../pages/Admin/AdminPrecios'
import AdminRecetas from '../pages/Admin/AdminRecetas'
import AdminConfiguracion from '../pages/Admin/AdminConfiguracion'

// Componentes de Agricultor
import Dashboard from '../components/Agricultor/Dashboard/Dashboard'
import MisProductos from '../components/Agricultor/MisProductos/index'
import MisFerias from '../components/Agricultor/MisFerias/index'
import Configuracion from '../components/Agricultor/Configuracion/index'

// Componentes de Administración y Auth
import AdminLayout from '../components/admin/AdminLayout'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'
import RegisterForm from '../components/auth/RegisterFormAgricultor'

const Routing: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/auth" element={<LoginYRegistroPage />} />
        <Route path="/login" element={<LoginYRegistroPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/ferias" element={<FeriasPage />} />
        <Route path="/recetas" element={<RecetasPage />} />
        <Route path="/registro-agricultor" element={<RegistroAgricultorPage />} />

        {/* Panel Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><Outlet /></AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="ferias" element={<AdminFerias />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="precios" element={<AdminPrecios />} />
          <Route path="recetas" element={<AdminRecetas />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>

        {/* Rutas protegidas - Agricultor */}
        <Route
          path="/agricultor"
          element={
            <ProtectedRoute allowedRoles={['Agricultor']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agricultor/productos"
          element={
            <ProtectedRoute allowedRoles={['Agricultor']}>
              <MisProductos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agricultor/ferias"
          element={
            <ProtectedRoute allowedRoles={['Agricultor']}>
              <MisFerias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agricultor/config"
          element={
            <ProtectedRoute allowedRoles={['Agricultor']}>
              <Configuracion />
            </ProtectedRoute>
          }
        />

        {/* Catch all - fallback al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default Routing

