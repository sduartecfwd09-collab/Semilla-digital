import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Comparar from '../pages/Comparar';




import LoginYRegistroPage from '../pages/LoginYRegistro';
import Dashboard from '../components/Agricultor/Dashboard/Dashboard'
import MisProductos from '../components/Agricultor/MisProductos/index'
import MisFerias from '../components/Agricultor/MisFerias/index'
import Configuracion from '../components/Agricultor/Configuracion/index'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'
import RegisterForm from '../components/auth/RegisterFormAgricultor'
const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
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
  )
}

export default Routing
