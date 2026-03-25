import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Páginas Principales
import Home from '../pages/Home';
import Comparar from '../pages/Comparar';
import LoginYRegistroPage from '../pages/LoginYRegistro';
import Profile from '../pages/Profile';
import FeriasPage from '../pages/Ferias';
import RecetasPage from '../pages/Recetas';
import RegistroAgricultorPage from '../pages/RegistroAgricultor';
import ContactUs from '../components/ContactUs/ContactUs';

// Páginas de Administración (Unidas desde el merge)
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsuarios from '../pages/Admin/AdminUsuarios';
import AdminSolicitudes from '../pages/Admin/AdminSolicitudes/AdminSolicitudes';
import AdminAgricultores from '../pages/Admin/AdminAgricultores/AdminAgricultores';
import AdminProductos from '../pages/Admin/AdminProductos';
import AdminRecetas from '../pages/Admin/AdminRecetas';
import AdminConfiguracion from '../pages/Admin/AdminConfiguracion';
import AdminContactos from '../pages/Admin/AdminContactos/AdminContactos';
import AdminLayout from '../components/admin/AdminLayout';

// Páginas de Agricultor (Unidas desde el merge)
import Dashboard from '../components/Agricultor/Dashboard/Dashboard'
import MisProductos from '../components/Agricultor/MisProductos/index'
import MisFerias from '../components/Agricultor/MisFerias/MisFerias'
import Configuracion from '../components/Agricultor/Configuracion/index'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'

const Routing: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/auth" element={<LoginYRegistroPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} /> {/* Aliasing login to auth */}
        <Route path="/ferias" element={<FeriasPage />} />
        <Route path="/recetas" element={<RecetasPage />} />
        <Route path="/contacto" element={<ContactUs />} />
        
        {/* Rutas de Usuario */}
        <Route path="/perfil" element={<Profile />} />
        <Route path="/registro-agricultor" element={<RegistroAgricultorPage />} />

        {/* Panel Administrador (Protegido por rol 'Administrador') */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <AdminLayout><Outlet /></AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="solicitudes" element={<AdminSolicitudes />} />
          <Route path="agricultores" element={<AdminAgricultores />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="recetas" element={<AdminRecetas />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
          <Route path="contactos" element={<AdminContactos />} />
        </Route>

        {/* Rutas de Agricultor (Protegido por rol 'Agricultor') */}
        <Route 
          path="/agricultor" 
          element={
            <ProtectedRoute allowedRoles={['Agricultor', 'admin_feriante']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<MisProductos />} />
          <Route path="ferias" element={<MisFerias />} />
          <Route path="config" element={<Configuracion />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default Routing
