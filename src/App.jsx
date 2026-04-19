import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Landing from './frontend/pages/landing/Landing'
import Login from './frontend/pages/auth/Login'
import Admin from './frontend/pages/admin/Admin'
import User from './frontend/pages/user/User'
import Staff from './frontend/pages/staff/Staff'
import './App.css'

/*
 * SECURITY WARNING: localStorage Usage
 * 
 * WARNING: localStorage stores data in plain text and is vulnerable to XSS (Cross-Site Scripting) attacks.
 * Any malicious JavaScript code injected into the page can read, modify, or delete localStorage data.
 * 
 * - Sensitive data stored in localStorage is accessible to any JavaScript running on the page
 * - Data persists across browser sessions and is not encrypted
 * - Should NOT be used for highly sensitive information in untrusted environments
 * 
 * This application uses localStorage for session persistence (no JWT implementation exists).
 * Always ensure sensitive data is properly cleared on logout.
 */

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Check sessionStorage on initial load to persist user session per tab
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate()
  const location = useLocation()

  // Save current path to sessionStorage when navigating
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('lastPath', location.pathname);
    }
  }, [location.pathname, currentUser]);

  // Redirect to last saved path on page refresh when user is already logged in
  useEffect(() => {
    if (currentUser) {
      const lastPath = sessionStorage.getItem('lastPath');
      if (lastPath && lastPath !== location.pathname && lastPath !== '/login' && lastPath !== '/') {
        navigate(lastPath, { replace: true });
      }
    }
  },); // Empty dependency array - only run once on mount

  const handleLogin = (user) => {
    setCurrentUser(user)
    // Use sessionStorage for per-tab session storage
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Save profile image separately for header
    if (user.profileImage) {
      sessionStorage.setItem('userProfileImage', user.profileImage);
    }
    
    // Save full name for logout tracking
    sessionStorage.setItem('lastFullName', user.fullName || user.username || '');
    
    // Check if there's a saved path to redirect to
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath && lastPath !== '/login' && lastPath !== '/') {
      sessionStorage.removeItem('lastPath');
      navigate(lastPath, { replace: true });
    } else if (user.role === 'admin') {
      navigate('/dashboard', { replace: true })
    } else if (user.role === 'staff') {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleLogout = async () => {
    try {
      // Get user from sessionStorage
      const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userProfileData = JSON.parse(sessionStorage.getItem('userProfileData') || '{}');
      
      // Get the full name (from login or from profile updates)
      const fullName = sessionStorage.getItem('lastFullName') || storedUser.full_name || storedUser.username;
      
      // Call logout endpoint to log the action
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: storedUser,
          full_name: fullName,
          profile_image: userProfileData.profile_image || storedUser.profileImage || null
        })
      });
      
      await response.json();
    } catch (error) {
      console.error('Error logging logout:', error);
    }
    
    // Clear sessionStorage and navigate
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userProfileData');
    sessionStorage.removeItem('userProfileImage');
    sessionStorage.removeItem('lastPath');
    sessionStorage.removeItem('lastFullName');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      {!currentUser ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : currentUser.role === 'admin' ? (
        <Routes>
          <Route path="/*" element={<Admin user={currentUser} onLogout={handleLogout} />} />
        </Routes>
      ) : currentUser.role === 'staff' ? (
        <Routes>
          <Route path="/*" element={<Staff user={currentUser} onLogout={handleLogout} />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/*" element={<User user={currentUser} onLogout={handleLogout} />} />
        </Routes>
      )}
    </div>
  )
}

export default App
