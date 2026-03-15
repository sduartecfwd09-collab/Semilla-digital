import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Comparar from '../pages/Comparar';

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comparar" element={<Comparar />} />
      </Routes>
    </Router>
  );
};

export default Routing
