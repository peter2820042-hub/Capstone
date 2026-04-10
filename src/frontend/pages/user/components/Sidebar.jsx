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
      label: "MAP", 
      path: "/gis",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      )
    },
    { 
      label: "BILLING", 
      path: "/billing",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    },
    { 
      label: "PAYMENT", 
      path: "/payment",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    { 
      label: "VIOLATION", 
      path: "/violation",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    { 
      label: "NOTIFICATION", 
      path: "/notification",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
            <p className="brand-tagline">Homeowners Panel</p>
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