import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Landing from './frontend/pages/landing/Landing'
import Login from './frontend/pages/auth/Login'
import Admin from './frontend/pages/admin/Admin'
import User from './frontend/pages/user/User'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  const handleLogin = (user) => {
    setCurrentUser(user)
    // Redirect to dashboard based on user role
    if (user.role === 'admin') {
      navigate('/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    // Use setTimeout to ensure navigation happens after state update
    setTimeout(() => {
      navigate('/login', { replace: true })
    }, 0)
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
      ) : (
        <Routes>
          <Route path="/*" element={<User user={currentUser} onLogout={handleLogout} />} />
        </Routes>
      )}
    </div>
  )
}

export default App
