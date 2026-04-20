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

function Admin({ user, onLogout }) {
  return (
    <div className="staff-container">
      <Sidebar onLogout={onLogout} />
      <div className="staff-content">
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
            <Header pageName="Residents" user={user} />
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
          <Route path="/notification" element={<>
            <Header pageName="Notification" user={user} />
            <Notification />
          </>} />
          <Route path="/profile" element={
            <Profile user={user} />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default Admin;
