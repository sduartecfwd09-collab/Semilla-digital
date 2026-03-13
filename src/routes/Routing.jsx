import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Compare from '../pages/Compare/Compare';

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/comparar" element={<Compare />} />
    </Routes>
  );
};

export default Routing
