import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ALL_SPECIALTIES = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Ophthalmologist',
  'Gastroenterologist', 'Dermatologist', 'Orthopedist', 'ENT Specialist',
]

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'PATIENT', phoneNumber: '',
    // Doctor fields
    specialty: '', city: '', clinicAddress: '', experienceYears: '', consultationFee: '', bio: '',
  })
  const [error, setError]     = useState('')
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
      await register({
        ...form,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        consultationFee: form.consultationFee ? parseInt(form.consultationFee) : null,
      })
      navigate('/login')
    } catch {
      setError('Registration failed. Username or email may already be taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 24 }}>
          <div className="app-name" style={{ fontSize: 28 }}>Create Account</div>
          <div className="subtitle">Join MediSecond today</div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Role selector */}
        <div className="role-toggle">
          {['PATIENT', 'DOCTOR'].map((r) => (
            <button key={r} type="button"
              className={`role-btn ${form.role === r ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: r })}>
              {r === 'PATIENT' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            {/* Common fields */}
            <div className="input-field-wrapper">
              <label className="input-label">Username *</label>
              <input className="input" name="username" value={form.username} onChange={handleChange}
                placeholder="Choose a username" autoCapitalize="none" />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Email *</label>
              <input className="input" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Password *</label>
              <input className="input" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Choose a strong password" />
            </div>
            <div className="input-field-wrapper">
              <label className="input-label">Phone Number</label>
              <input className="input" name="phoneNumber" value={form.phoneNumber}
                onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            {/* Doctor-specific fields */}
            {form.role === 'DOCTOR' && (
              <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                    🏥 Doctor Profile (helps patients find you)
                  </div>
                </div>

                <div className="input-field-wrapper">
                  <label className="input-label">Specialty *</label>
                  <select className="input" name="specialty" value={form.specialty} onChange={handleChange} required>
                    <option value="">Select your specialty</option>
                    {ALL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="input-field-wrapper">
                  <label className="input-label">City *</label>
                  <input className="input" name="city" value={form.city} onChange={handleChange}
                    placeholder="Mumbai, Delhi, Bangalore…" />
                </div>

                <div className="input-field-wrapper">
                  <label className="input-label">Clinic Address</label>
                  <input className="input" name="clinicAddress" value={form.clinicAddress}
                    onChange={handleChange} placeholder="123, MG Road, Andheri West" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-field-wrapper">
                    <label className="input-label">Experience (yrs)</label>
                    <input className="input" name="experienceYears" type="number" min="0"
                      value={form.experienceYears} onChange={handleChange} placeholder="10" />
                  </div>
                  <div className="input-field-wrapper">
                    <label className="input-label">Fee (₹)</label>
                    <input className="input" name="consultationFee" type="number" min="0"
                      value={form.consultationFee} onChange={handleChange} placeholder="500" />
                  </div>
                </div>

                <div className="input-field-wrapper">
                  <label className="input-label">Bio / Qualifications</label>
                  <textarea className="input" name="bio" value={form.bio}
                    onChange={handleChange} rows={3}
                    placeholder="MBBS, MD Cardiology, AIIMS…" />
                </div>
              </>
            )}
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
