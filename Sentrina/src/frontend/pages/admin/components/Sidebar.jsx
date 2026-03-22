import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../../../assets/logo.png';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "DASHBOARD", path: "/dashboard" },
    { label: "GIS MAP", path: "/gis" },
    { label: "RESIDENTS", path: "/residents" },
    { label: "BILLING", path: "/billing" },
    { label: "PAYMENTS", path: "/payments" },
    { label: "VIOLATIONS", path: "/violations" },
    { label: "REPORTS", path: "/reports" },
    { label: "AUDIT LOGS", path: "/audit-logs" },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className="sidebar">
      
      <div className="sidebar-brand">
        <div className="brand-container">
          <img src={logo} alt="Sentrina" className="logo" />
          <div className="brand-text">
            <h1>SENTRINA</h1>
            <p className="brand-tagline">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-text">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
