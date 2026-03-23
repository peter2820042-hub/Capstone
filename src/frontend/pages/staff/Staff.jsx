import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from '../../../components/Header';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Violations from './pages/Violations';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import './components/Dashboard.css';

function Staff({ user, onLogout }) {
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
          <Route path="/residents" element={<>
            <Header pageName="Account Management" user={user} />
            <Residents />
          </>} />
          <Route path="/violations" element={<>
            <Header pageName="Violations" user={user} />
            <Violations />
          </>} />
          <Route path="/reports" element={<>
            <Header pageName="Reports" user={user} />
            <Reports />
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

export default Staff;
