import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PATIENT',
    phoneNumber: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    try {
      setLoading(true)
      setError('')
      await register(form)
      navigate('/login')
    } catch {
      setError('Registration failed. Username or email may already be taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 24 }}>
          <div className="app-name" style={{ fontSize: 30 }}>Create Account</div>
          <div className="subtitle">Join MediSecond today</div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Role selector */}
        <div className="role-toggle">
          {['PATIENT', 'DOCTOR'].map((r) => (
            <button
              key={r}
              type="button"
              className={`role-btn ${form.role === r ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: r })}
            >
              {r === 'PATIENT' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-field-wrapper">
              <label className="input-label">Username *</label>
              <input className="input" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" autoCapitalize="none" />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Email *</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Password *</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Choose a strong password" />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Phone Number (optional)</label>
              <input className="input" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <div className="link-text">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    </div>
  )
}
