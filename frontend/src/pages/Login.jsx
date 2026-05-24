import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please enter all fields.')
      return
    }
    try {
      setLoading(true)
      setError('')
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 32 }}>
          <div className="app-name">MediSecond</div>
          <div className="subtitle">Welcome back – sign in to continue</div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-field-wrapper">
              <label className="input-label">Username</label>
              <input
                className="input"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                autoCapitalize="none"
                autoComplete="username"
              />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Password</label>
              <input
                className="input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="link-text">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}
