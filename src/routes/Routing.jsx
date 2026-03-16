import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Comparar from '../pages/Comparar';
import LoginYRegistroPage from '../pages/LoginYRegistro';

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/auth" element={<LoginYRegistroPage />} />
      </Routes>
    </Router>
  );
};

export default Routing
