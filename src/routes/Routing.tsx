import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Comparar from '../pages/Comparar';
import LoginYRegistroPage from '../pages/LoginYRegistro';
import Profile from '../pages/Profile';
import FeriasPage from '../pages/Ferias';
import RecetasPage from '../pages/Recetas';
import RegistroAgricultorPage from '../pages/RegistroAgricultor';

const Routing: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/auth" element={<LoginYRegistroPage />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/ferias" element={<FeriasPage />} />
        <Route path="/recetas" element={<RecetasPage />} />
        <Route path="/registro-agricultor" element={<RegistroAgricultorPage />} />
      </Routes>
    </Router>
  );
};

export default Routing

