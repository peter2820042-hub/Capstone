import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../../../assets/logo.png';
import { DashboardIcon, GisIcon, ResidentIcon, BillingIcon, PaymentsIcon, ViolationsIcon, ReportsIcon, AuditLogsIcon, ProfileIcon, PlusIcon, CloseIcon, FileIcon, UsersIcon, HomeIcon, MoneyIcon, CheckCircleIcon, WarningIcon, InfoIcon, TrashIcon, SearchIcon, EditIcon, CalendarIcon, CheckIcon, DownloadIcon, UploadIcon, ChevronLeftIcon, ChevronRightIcon, MenuIcon as MenuIconComponent } from '../../../../components/Icons';

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
      label: "GIS MAP", 
      path: "/gis",
      icon: <GisIcon />
    },
    { 
      label: "RESIDENT", 
      path: "/residents",
      icon: <ResidentIcon />
    },
    { 
      label: "PAYMENTS", 
      path: "/payments",
      icon: <PaymentsIcon />
    },
    { 
      label: "BILLING", 
      path: "/billing",
      icon: <BillingIcon />
    },
    { 
      label: "VIOLATIONS", 
      path: "/violations",
      icon: <ViolationsIcon />
    },
    { 
      label: "REPORTS", 
      path: "/reports",
      icon: <ReportsIcon />
    },
    { 
      label: "AUDIT LOGS", 
      path: "/audit-logs",
      icon: <AuditLogsIcon />
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
