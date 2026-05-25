import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Package, DollarSign, LogOut } from 'lucide-react';
import './DriverSidebar.css';

const DriverSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="driver-sidebar">
      <div className="sidebar-header">
        <div className="driver-avatar">
          {user?.name?.charAt(0).toUpperCase() || 'D'}
        </div>
        <div className="driver-info">
          <h3>{user?.name || 'Repartidor'}</h3>
          <span className="driver-role">Cuenta verificada ✓</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/driver" 
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Inicio</span>
        </NavLink>
        
        <NavLink 
          to="/driver/orders" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={20} />
          <span>Mis Pedidos</span>
        </NavLink>

        <NavLink 
          to="/driver/earnings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <DollarSign size={20} />
          <span>Ganancias</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default DriverSidebar;
