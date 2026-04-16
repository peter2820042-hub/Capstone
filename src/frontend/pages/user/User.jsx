import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from '../../../components/Header';
import Dashboard from './pages/Dashboard';
import Gis from './pages/Gis';
import History from './pages/History';
import Payment from './pages/Payment';
import Profile from './pages/Profile';

function User({ user, onLogout }) {
  return (
    <div className="user-container">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<>
            <Header pageName="Dashboard" user={user} />
            <Dashboard />
          </>} />
          <Route path="/dashboard" element={<>
            <Header pageName="Dashboard" user={user} />
            <Dashboard />
          </>} />
          <Route path="/gis" element={<>
            <Header pageName="My Lot Map" user={user} />
            <Gis />
          </>} />
          <Route path="/history" element={<>
            <Header pageName="History" user={user} />
            <History user={user} />
          </>} />
          <Route path="/payment" element={<>
            <Header pageName="Payment History" user={user} />
            <Payment user={user} />
          </>} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

export default User;
