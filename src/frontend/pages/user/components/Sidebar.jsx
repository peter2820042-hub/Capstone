import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../../../assets/logo.png';
import { DashboardIcon, GisIcon, BillingIcon, PaymentsIcon, ViolationsIcon, NotificationIcon, ProfileIcon } from '../../../../components/Icons';

const Sidebar = ({ onLogout, isDropdown = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      label: "DASHBOARD", 
      path: "/dashboard",
      icon: <DashboardIcon />
    },
    { 
      label: "MAP", 
      path: "/gis",
      icon: <GisIcon />
    },
    { 
      label: "BILLING", 
      path: "/billing",
      icon: <BillingIcon />
    },
    { 
      label: "PAYMENT", 
      path: "/payment",
      icon: <PaymentsIcon />
    },
    { 
      label: "VIOLATION", 
      path: "/violation",
      icon: <ViolationsIcon />
    },
    { 
      label: "NOTIFICATION", 
      path: "/notification",
      icon: <NotificationIcon />
    },
    { 
      label: "PROFILE", 
      path: "/profile",
      icon: <ProfileIcon />
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