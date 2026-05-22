import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import Footer from '../../Footer/Footer';
import DriverSidebar from './DriverSidebar';
import './DriverLayout.css';

const DriverLayout: React.FC = () => {
  return (
    <div className="driver-layout-root">
      <Navbar />
      <div className="driver-layout-container">
        <DriverSidebar />
        <main className="driver-main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DriverLayout;
