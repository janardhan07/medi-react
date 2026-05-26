import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ALL_SPECIALTIES, SPECIALTY_ICONS, INDIAN_CITIES } from '../components/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function DoctorProfileEdit() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName:          user?.fullName          || '',
    gender:            user?.gender            || '',
    phoneNumber:       user?.phoneNumber       || '',
    specialty:         user?.specialty         || '',
    city:              user?.city              || '',
    area:              user?.area              || '',
    clinicName:        user?.clinicName        || '',
    clinicAddress:     user?.clinicAddress     || '',
    experienceYears:   user?.experienceYears   || '',
    consultationFee:   user?.consultationFee   || '',
    bio:               user?.bio               || '',
    qualifications:    user?.qualifications    || '',
    languages:         user?.languages         || '',
    available:         user?.available !== false,
    onlineConsultation: user?.onlineConsultation || false,
  })
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState({ text:'', type:'' })

  if (user?.role !== 'DOCTOR') {
    return (
      <div className="page">
        <Navbar />
        <div className="empty"><div className="empty-icon">🚫</div><div>Only doctors can access this page.</div></div>
      </div>
    )
  }

  const set = field => e =>
    setForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async e => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text:'', type:'' })
    try {
      const res = await api.put('/api/doctors/profile', {
        ...form,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        consultationFee: form.consultationFee  ? parseInt(form.consultationFee)  : null,
      })
      updateUser({ ...user, ...res.data })
      setMsg({ text:'✅ Profile updated successfully!', type:'success' })
    } catch {
      setMsg({ text:'❌ Failed to update profile. Please try again.', type:'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:620 }}>
        <button style={{ background:'none', border:'none', color:'#2563eb', fontWeight:600, cursor:'pointer', marginBottom:16 }}
          onClick={() => navigate('/dashboard')}>← Dashboard</button>

        <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Edit Profile</div>
        <div style={{ color:'#64748b', marginBottom:24 }}>
          Keep your profile updated — patients search by city, specialty and area.
        </div>

        {msg.text && (
          <div className={`alert ${msg.type==='success'?'alert-success':'alert-error'}`} style={{ marginBottom:20 }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Personal */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:16, marginBottom:16, color:'#2563eb' }}>👤 Personal Info</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.fullName} onChange={set('fullName')}
                    placeholder="Dr. Rajesh Kumar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={set('gender')}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phoneNumber} onChange={set('phoneNumber')}
                  placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>

          {/* Practice */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:16, marginBottom:16, color:'#2563eb' }}>🏥 Practice Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <select className="form-input" value={form.specialty} onChange={set('specialty')}>
                  <option value="">Select specialty</option>
                  {ALL_SPECIALTIES.map(s => <option key={s} value={s}>{SPECIALTY_ICONS[s]} {s}</option>)}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select className="form-input" value={form.city} onChange={set('city')}>
                    <option value="">Select city</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Locality</label>
                  <input className="form-input" value={form.area} onChange={set('area')}
                    placeholder="Koramangala, Andheri West…" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Clinic / Hospital Name</label>
                <input className="form-input" value={form.clinicName} onChange={set('clinicName')}
                  placeholder="Apollo Clinic, Fortis Hospital…" />
              </div>
              <div className="form-group">
                <label className="form-label">Full Clinic Address</label>
                <input className="form-input" value={form.clinicAddress} onChange={set('clinicAddress')}
                  placeholder="123, MG Road, Andheri West, Mumbai - 400058" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" min="0" max="60"
                    value={form.experienceYears} onChange={set('experienceYears')} placeholder="10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input className="form-input" type="number" min="0"
                    value={form.consultationFee} onChange={set('consultationFee')} placeholder="500" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input className="form-input" value={form.qualifications} onChange={set('qualifications')}
                  placeholder="MBBS, MD Cardiology, AIIMS Delhi" />
              </div>
              <div className="form-group">
                <label className="form-label">Languages Spoken</label>
                <input className="form-input" value={form.languages} onChange={set('languages')}
                  placeholder="English, Hindi, Tamil" />
              </div>
              <div className="form-group">
                <label className="form-label">About You / Bio</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={set('bio')}
                  placeholder="Describe your expertise, approach, and areas of focus…" />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:600 }}>
                  <input type="checkbox" checked={form.available} onChange={set('available')}
                    style={{ width:18, height:18, accentColor:'#2563eb' }} />
                  I am accepting new patients
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:600 }}>
                  <input type="checkbox" checked={form.onlineConsultation} onChange={set('onlineConsultation')}
                    style={{ width:18, height:18, accentColor:'#2563eb' }} />
                  I offer online / video consultations
                </label>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Saving…' : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
