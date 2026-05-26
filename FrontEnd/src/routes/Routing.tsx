import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Páginas Principales
import Home from '../pages/Home';
import Comparar from '../pages/Comparar';
import LoginYRegistroPage from '../pages/LoginYRegistro';
import Profile from '../pages/Profile';
import FeriasPage from '../pages/Ferias';
import RecetasPage from '../pages/Recetas';
import RegistroProductorPage from '../pages/RegistroProductor';
import ContactUs from '../components/ContactUs/ContactUs';
import ProformaPage from '../components/Proforma/ProformaPage';
import RecuperarPassword from '../pages/RecuperarPassword';
import ResetPassword from '../pages/ResetPassword';

// Páginas de Administración (Unidas desde el merge)
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsuarios from '../pages/Admin/AdminUsuarios';
import AdminSolicitudes from '../pages/Admin/AdminSolicitudes/AdminSolicitudes';
import AdminProductores from '../pages/Admin/AdminProductores/AdminProductores';
import AdminProductos from '../pages/Admin/AdminProductos';
import AdminRecetas from '../pages/Admin/AdminRecetas';
import AdminConfiguracion from '../pages/Admin/AdminConfiguracion';
import AdminContactos from '../pages/Admin/AdminContactos/AdminContactos';
import AdminRepartidores from '../pages/Admin/AdminRepartidores/AdminRepartidores';
import AdminLiquidaciones from '../pages/Admin/AdminLiquidaciones/AdminLiquidaciones';
import AdminLayout from '../components/admin/AdminLayout';

// Páginas de Productor (Unidas desde el merge)
import Dashboard from '../components/Productor/Dashboard/Dashboard'
import MisProductos from '../components/Productor/MisProductos/index'
import MisFerias from '../components/Productor/MisFerias/MisFerias'
import Configuracion from '../components/Productor/Configuracion/index'
import Ganancias from '../components/Productor/Ganancias/Ganancias'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'

// Rutas de Delivery
import DeliveryDashboard from '../components/Delivery/DeliveryDashboard';
import ClientDeliveryTracker from '../components/Delivery/ClientDeliveryTracker';
import RegistroDelivery from '../components/Delivery/RegistroDelivery';
import DriverLayout from '../components/Delivery/Driver/DriverLayout';
import DriverOrders from '../components/Delivery/Driver/DriverOrders';
import DriverEarnings from '../components/Delivery/Driver/DriverEarnings';

const Routing: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/auth" element={<LoginYRegistroPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} /> {/* Aliasing login to auth */}
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ferias" element={<FeriasPage />} />
        <Route path="/recetas" element={<RecetasPage />} />
        <Route path="/contacto" element={<ContactUs />} />
        <Route path="/proforma" element={<ProformaPage />} />
        
        {/* Rutas de Usuario */}
        <Route path="/perfil" element={<Profile />} />
        <Route path="/registro-productor" element={<RegistroProductorPage />} />

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
          <Route path="productores" element={<AdminProductores />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="recetas" element={<AdminRecetas />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
          <Route path="contactos" element={<AdminContactos />} />
          <Route path="repartidores" element={<AdminRepartidores />} />
          <Route path="liquidaciones" element={<AdminLiquidaciones />} />
        </Route>

        {/* Rutas de Productor (Protegido por rol 'Productor') */}
        <Route 
          path="/productor" 
          element={
            <ProtectedRoute allowedRoles={['Productor', 'admin_feriante']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<MisProductos />} />
          <Route path="ferias" element={<MisFerias />} />
          <Route path="config" element={<Configuracion />} />
          <Route path="ganancias" element={<Ganancias />} />
        </Route>

        {/* Rutas de Tracker de Cliente (Protegido para Usuario) */}
        <Route 
          path="/delivery/track/:id" 
          element={
            <ProtectedRoute allowedRoles={['Usuario', 'Administrador']}>
              <ClientDeliveryTracker />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/registro-delivery" 
          element={
            <ProtectedRoute allowedRoles={['Usuario', 'Cliente']}>
              <RegistroDelivery />
            </ProtectedRoute>
          } 
        />

        {/* Rutas de Repartidor (Protegido por rol 'DRIVER' o 'Repartidor') */}
        <Route 
          path="/driver" 
          element={
            <ProtectedRoute allowedRoles={['DRIVER', 'Repartidor']}>
              <DriverLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<DeliveryDashboard />} />
          <Route path="orders" element={<DriverOrders />} />
          <Route path="earnings" element={<DriverEarnings />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default Routing
