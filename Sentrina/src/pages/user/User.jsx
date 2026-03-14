import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from '../../components/Header';
import Dashboard from './pages/Dashboard';
import Gis from './pages/Gis';
import Billing from './pages/Billing';
import Payment from './pages/Payment';
import Violation from './pages/Violation';
import Notification from './pages/Notification';
import Profile from './pages/Profile';

function User({ user, onLogout }) {
  return (
    <div className="user-container">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
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
            <Header pageName="My Lot Map" user={user} />
            <Gis />
          </>} />
          <Route path="/billing" element={<>
            <Header pageName="Billing" user={user} />
            <Billing />
          </>} />
          <Route path="/payment" element={<>
            <Header pageName="Payment" user={user} />
            <Payment />
          </>} />
          <Route path="/violation" element={<>
            <Header pageName="Violation" user={user} />
            <Violation />
          </>} />
          <Route path="/notification" element={<>
            <Header pageName="Notification" user={user} />
            <Notification />
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

export default User;
