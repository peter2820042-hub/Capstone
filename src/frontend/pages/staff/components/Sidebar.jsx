import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../../../assets/logo.png';

const Sidebar = ({ onLogout, isDropdown = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      label: "DASHBOARD", 
      path: "/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    { 
      label: "Resident", 
      path: "/residents",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    { 
      label: "VIOLATIONS", 
      path: "/violations",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    { 
      label: "REPORTS", 
      path: "/reports",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    { 
      label: "PROFILE", 
      path: "/profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (isDropdown) {
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Dropdown mode - used in header
  if (isDropdown) {
    return (
      <div className="sidebar-dropdown">
        <button 
          className="dropdown-toggle"
          onClick={toggleDropdown}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">☰</span>
        </button>
        <div className={`dropdown-content ${isOpen ? 'open' : ''}`}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`dropdown-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
          <button 
            onClick={handleLogout}
            className="dropdown-item logout"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Original sidebar mode
  return (
    <aside className="sidebar">
      
      <div className="sidebar-brand">
        <div className="brand-container">
          <img src={logo} alt="Sentrina" className="logo" />
          <div className="brand-text">
            <h1>SENTRINA</h1>
            <p className="brand-tagline">Staff Panel</p>
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
              <span className="nav-icon">{item.icon}</span>
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
