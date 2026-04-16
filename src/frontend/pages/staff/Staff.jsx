import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from '../../../components/Header';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Violations from './pages/Violations';
import Reports from './pages/Reports';
import Notification from './pages/Notification';
import Profile from './pages/Profile';
import Gis from './pages/Gis';
import Payment from './pages/Payment';
import Billing from './pages/Billing';

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
          <Route path="/gis" element={<>
            <Header pageName="GIS" user={user} />
            <Gis />
          </>} />
          <Route path="/residents" element={<>
            <Header pageName="Residents" user={user} />
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
          <Route path="/notification" element={<>
            <Header pageName="Notification" user={user} />
            <Notification />
          </>} />
          <Route path="/profile" element={
            <Profile user={user} />
          } />
          <Route path="/payment" element={<>
            <Header pageName="Payment" user={user} />
            <Payment />
          </>} />
          <Route path="/billing" element={<>
            <Header pageName="Billing" user={user} />
            <Billing />
          </>} />
        </Routes>
      </div>
    </div>
  );
}

export default Staff;
