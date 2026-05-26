import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isActive  = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Medi<span>Second</span>
        </div>
        <div className="navbar-actions">
          <button className={isActive('/find-doctors')} onClick={() => navigate('/find-doctors')}>
            Find Doctors
          </button>
          <button className={isActive('/symptom-check')} onClick={() => navigate('/symptom-check')}>
            🤖 AI Checker
          </button>
          {user ? (
            <>
              <button className={isActive('/dashboard')} onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              {user.role === 'DOCTOR' && (
                <button className={isActive('/doctor/profile')} onClick={() => navigate('/doctor/profile')}>
                  My Profile
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
