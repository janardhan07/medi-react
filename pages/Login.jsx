import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  // Completely avoid form submit — use button onClick instead
  // This 100% prevents any GET request
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(username.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Invalid username or password. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Allow pressing Enter in either field
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div style={{ marginBottom: 32 }}>
          <div className="app-name">MediSecond</div>
          <div className="subtitle">Welcome back – sign in to continue</div>
        </div>

        {/* Error stays until next attempt */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20, lineHeight: 1.5 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="input-group">
          <div className="input-field-wrapper">
            <label className="input-label">Username</label>
            <input
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="input-field-wrapper">
            <label className="input-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </div>

        {/* Plain button — NOT inside a form, NO type="submit", NO GET possible */}
        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div className="link-text">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')}>Sign Up</button>
        </div>

      </div>
    </div>
  )
}
