import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import Comparar from '../pages/Comparar';

// Páginas de Administración
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsuarios from '../pages/Admin/AdminUsuarios';
import AdminFerias from '../pages/Admin/AdminFerias';
import AdminProductos from '../pages/Admin/AdminProductos';
import AdminPrecios from '../pages/Admin/AdminPrecios';
import AdminRecetas from '../pages/Admin/AdminRecetas';
import AdminConfiguracion from '../pages/Admin/AdminConfiguracion';

// Páginas de Agricultor
import LoginYRegistroPage from '../pages/LoginYRegistro';
import Dashboard from '../components/Agricultor/Dashboard/Dashboard'
import MisProductos from '../components/Agricultor/MisProductos/index'
import MisFerias from '../components/Agricultor/MisFerias/index'
import Configuracion from '../components/Agricultor/Configuracion/index'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'
import RegisterForm from '../components/auth/RegisterFormAgricultor'  

// Componentes de Administración
import AdminLayout from '../components/admin/AdminLayout';

const Routing = () => {
  return (
    <Router>
      <Routes>
        {/* Redireccionar raíz al admin directamente */}
        {/*<Route path="/" element={<Navigate to="/admin" replace />} />*/}
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />

        {/* Panel Admin como estructura principal */}
        <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
          <Route index element={<AdminDashboard />} />
          {/*<Route path="home" element={<Navigate to="/admin" replace />} />*/}
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="ferias" element={<AdminFerias />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="precios" element={<AdminPrecios />} />
          <Route path="recetas" element={<AdminRecetas />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>

        {/* Catch all - fallback al admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>

      <Routes>
        <Route path="/login" element={<LoginYRegistroPage />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Rutas protegidas - Agricultor */}
        <Route
          path="/agricultor"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agricultor/productos"
          element={
            <ProtectedRoute>
              <MisProductos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agricultor/ferias"
          element={
            <ProtectedRoute>
              <MisFerias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agricultor/config"
          element={
            <ProtectedRoute>
              <Configuracion />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default Routing
