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
import Profile from './pages/Profile';
import './components/Dashboard.css';

function Admin({ user, onLogout }) {
  return (
    <div className="admin-container">
      <Sidebar onLogout={onLogout} />
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<>
            <Header pageName="Dashboard" user={user} />
            <Dashboard user={user} />
          </>} />
          <Route path="/dashboard" element={<>
            <Header pageName="Dashboard" user={user} />
            <Dashboard user={user} />
          </>} />
          <Route path="/gis" element={<>
            <Header pageName="GIS" user={user} />
            <Gis />
          </>} />
          <Route path="/residents" element={<>
            <Header pageName="Account Management" user={user} />
            <Residents />
          </>} />

          <Route path="/billing" element={<>
            <Header pageName="Billing" user={user} />
            <Billing />
          </>} />
          <Route path="/payments" element={<>
            <Header pageName="Payments" user={user} />
            <Payments />
          </>} />
          <Route path="/violations" element={<>
            <Header pageName="Violations" user={user} />
            <Violations />
          </>} />
          <Route path="/reports" element={<>
            <Header pageName="Reports" user={user} />
            <Reports />
          </>} />
          <Route path="/audit-logs" element={<>
            <Header pageName="Audit Logs" user={user} />
            <AuditLogs />
          </>} />
          <Route path="/profile" element={<>
            <Header pageName="Profile" user={user} />
            <Profile user={user} />
          </>} />
        </Routes>
      </div>
    </div>
  );
}

export default Admin;

