import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from '../../../components/Header';
import Dashboard from './pages/Dashboard';
import Gis from './pages/Gis';
import Residents from './pages/Residents';
import Billing from './pages/Billing';
import Payments from './pages/Payments';
import Violations from './pages/Violations';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Notification from './pages/Notification';
import Profile from './pages/Profile';
import '../Violations.css';
import './components/Dashboard.css';

function Admin({ user, onLogout }) {
  // Default to dashboard
  const currentPath = window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
  
  return (
    <div className="admin-container">
      <Sidebar onLogout={onLogout} />
      <div className="admin-content">
        {currentPath === '/dashboard' || currentPath === '/' ? (
          <>
            <Header pageName="Dashboard" user={user} />
            <Dashboard />
          </>
        ) : currentPath === '/gis' ? (
          <>
            <Header pageName="GIS" user={user} />
            <Gis />
          </>
        ) : currentPath === '/residents' ? (
          <>
            <Header pageName="Resident" user={user} />
            <Residents />
          </>
        ) : currentPath === '/billing' ? (
          <>
            <Header pageName="Billing" user={user} />
            <Billing />
          </>
        ) : currentPath === '/payments' ? (
          <>
            <Header pageName="Payments" user={user} />
            <Payments />
          </>
        ) : currentPath === '/violations' ? (
          <>
            <Header pageName="Violations" user={user} />
            <Violations />
          </>
        ) : currentPath === '/reports' ? (
          <>
            <Header pageName="Reports" user={user} />
            <Reports />
          </>
        ) : currentPath === '/audit-logs' ? (
          <>
            <Header pageName="Audit Logs" user={user} />
            <AuditLogs />
          </>
        ) : currentPath === '/notification' ? (
          <>
            <Header pageName="Notification" user={user} />
            <Notification />
          </>
        ) : currentPath === '/profile' ? (
          <Profile user={user} />
        ) : (
          <>
            <Header pageName="Dashboard" user={user} />
            <Dashboard />
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;

