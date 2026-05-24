import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ALL_SPECIALTIES = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Ophthalmologist',
  'Gastroenterologist', 'Dermatologist', 'Orthopedist', 'ENT Specialist',
]

export default function DoctorProfileEdit() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    specialty: user?.specialty || '',
    city: user?.city || '',
    clinicAddress: user?.clinicAddress || '',
    experienceYears: user?.experienceYears || '',
    consultationFee: user?.consultationFee || '',
    bio: user?.bio || '',
    available: user?.available !== false,
  })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      await api.put('/api/doctors/profile', {
        ...form,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        consultationFee: form.consultationFee ? parseInt(form.consultationFee) : null,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'DOCTOR') {
    return <div className="empty-state"><div>Only doctors can access this page.</div></div>
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <button className="back-link" style={{ margin: 0 }} onClick={() => navigate('/dashboard')}>← Back</button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Edit My Profile</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="content" style={{ maxWidth: 580 }}>
        <div className="subtitle" style={{ marginBottom: 24 }}>
          Keep your profile updated so patients can find you by location and specialty.
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>Profile updated successfully!</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
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
                placeholder="Mumbai, Delhi, Bangalore…" required />
            </div>

            <div className="input-field-wrapper">
              <label className="input-label">Clinic Address</label>
              <input className="input" name="clinicAddress" value={form.clinicAddress} onChange={handleChange}
                placeholder="123, MG Road, Andheri West" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-field-wrapper">
                <label className="input-label">Experience (years)</label>
                <input className="input" name="experienceYears" type="number" min="0" max="60"
                  value={form.experienceYears} onChange={handleChange} placeholder="10" />
              </div>
              <div className="input-field-wrapper">
                <label className="input-label">Consultation Fee (₹)</label>
                <input className="input" name="consultationFee" type="number" min="0"
                  value={form.consultationFee} onChange={handleChange} placeholder="500" />
              </div>
            </div>

            <div className="input-field-wrapper">
              <label className="input-label">Bio / Qualifications</label>
              <textarea className="input" name="bio" value={form.bio} onChange={handleChange} rows={4}
                placeholder="MBBS, MD Cardiology, AIIMS Delhi. 10 years of experience in interventional cardiology…" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg)', borderRadius: 12 }}>
              <input type="checkbox" id="available" name="available"
                checked={form.available} onChange={handleChange}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <label htmlFor="available" style={{ cursor: 'pointer', fontWeight: 600 }}>
                I am currently accepting new patients
              </label>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
