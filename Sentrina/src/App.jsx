import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Admin from './pages/admin/Admin'
import User from './pages/user/User'
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
    navigate('/login')
  }

  return (
    <div className="app">
      {!currentUser ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
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
