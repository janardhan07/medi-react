import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ALL_SPECIALTIES, SPECIALTY_ICONS, INDIAN_CITIES } from '../components/helpers'

const STEPS = ['Account', 'Practice', 'Experience']

export default function Register() {
  const [role, setRole] = useState('PATIENT')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username:'', email:'', password:'', confirmPassword:'', phoneNumber:'', fullName:'', gender:'',
    specialty:'', city:'', area:'', clinicName:'', clinicAddress:'',
    experienceYears:'', consultationFee:'', bio:'', qualifications:'', languages:'', onlineConsultation:false,
    age:'', bloodGroup:'',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validateStep = () => {
    if (step === 1) {
      if (!form.username.trim())  return 'Username is required'
      if (!form.email.trim())     return 'Email is required'
      if (!form.fullName.trim())  return 'Full name is required'
      if (form.password.length < 6) return 'Password must be at least 6 characters'
      if (form.password !== form.confirmPassword) return 'Passwords do not match'
    }
    if (step === 2 && role === 'DOCTOR') {
      if (!form.specialty) return 'Please select your specialty'
      if (!form.city)      return 'City is required so patients can find you'
    }
    return ''
  }

  const next = e => {
    e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const submit = async e => {
    e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }
    try {
      setLoading(true)
      setError('')
      await register({
        username: form.username, email: form.email, password: form.password,
        role, phoneNumber: form.phoneNumber, fullName: form.fullName, gender: form.gender,
        specialty: form.specialty || null, city: form.city || null, area: form.area || null,
        clinicName: form.clinicName || null, clinicAddress: form.clinicAddress || null,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        consultationFee: form.consultationFee ? parseInt(form.consultationFee) : null,
        bio: form.bio || null, qualifications: form.qualifications || null,
        languages: form.languages || null, onlineConsultation: form.onlineConsultation,
        age: form.age ? parseInt(form.age) : null, bloodGroup: form.bloodGroup || null,
      })
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = role === 'DOCTOR' ? 3 : 1
  const isLast = role === 'PATIENT' || step === 3

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 32 }}>
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">MediSecond</div>
        <div className="auth-title">Create Account</div>
        <div className="auth-sub">Join thousands of patients and doctors</div>

        {/* Role Toggle */}
        <div className="role-tabs">
          {[['PATIENT','🧑 I am a Patient'],['DOCTOR','👨‍⚕️ I am a Doctor']].map(([v,l]) => (
            <button key={v} type="button"
              className={`role-tab ${role===v?'active':''}`}
              onClick={() => { setRole(v); setStep(1); setError('') }}>
              {l}
            </button>
          ))}
        </div>

        {/* Step indicator for doctors */}
        {role === 'DOCTOR' && (
          <div className="step-indicator" style={{ marginBottom: 24 }}>
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div className={`step-dot ${step>i+1?'done':step===i+1?'active':'pending'}`}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <div style={{ fontSize:10, fontWeight:600, color: step===i+1?'#2563eb':'#94a3b8' }}>{label}</div>
                </div>
                {i < 2 && <div className={`step-line ${step>i+1?'done':''}`} style={{ marginBottom:18 }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        {/* Step 1: Account */}
        {step === 1 && (
          <form onSubmit={role==='PATIENT' ? submit : next}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.fullName} onChange={set('fullName')}
                  placeholder={role==='DOCTOR'?'Dr. Rajesh Kumar':'John Doe'} />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-input" value={form.username} onChange={set('username')}
                  placeholder="Choose a unique username" autoCapitalize="none" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phoneNumber} onChange={set('phoneNumber')}
                  placeholder="+91 98765 43210" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" value={form.password} onChange={set('password')}
                    placeholder="Min 6 characters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input className="form-input" type="password" value={form.confirmPassword}
                    onChange={set('confirmPassword')} placeholder="Re-enter password" />
                </div>
              </div>
              {role === 'PATIENT' && (
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input className="form-input" type="number" min="1" max="120" value={form.age}
                      onChange={set('age')} placeholder="25" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-primary btn-full" type="submit" style={{ marginTop:20 }} disabled={loading}>
              {role==='PATIENT'?(loading?'Creating…':'Create Account'):'Next — Practice Details →'}
            </button>
          </form>
        )}

        {/* Step 2: Practice (Doctor only) */}
        {step === 2 && role === 'DOCTOR' && (
          <form onSubmit={next}>
            <div style={{ fontWeight:700, marginBottom:12, color:'#2563eb', fontSize:14 }}>
              📍 Your Practice & Location
            </div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
              Patients search by city and specialty — make sure this is accurate.
            </div>

            {/* Specialty visual grid */}
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Specialty *</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:6 }}>
                {ALL_SPECIALTIES.map(sp => (
                  <div key={sp} onClick={() => setForm(f=>({...f,specialty:sp}))}
                    style={{
                      padding:'10px 8px', borderRadius:10, cursor:'pointer', textAlign:'center',
                      border: form.specialty===sp?'2px solid #2563eb':'1.5px solid #e2e8f0',
                      background: form.specialty===sp?'#eff6ff':'#f8fafc',
                    }}>
                    <div style={{ fontSize:22 }}>{SPECIALTY_ICONS[sp]}</div>
                    <div style={{ fontSize:11, fontWeight:600, marginTop:4, lineHeight:1.2,
                      color: form.specialty===sp?'#2563eb':'#334155' }}>{sp}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select className="form-input" value={form.city} onChange={set('city')}>
                    <option value="">Select City</option>
                    {INDIAN_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Locality</label>
                  <input className="form-input" value={form.area} onChange={set('area')}
                    placeholder="Andheri West, Koramangala…" />
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
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="button" className="btn btn-outline" style={{ flex:1 }}
                onClick={() => { setStep(1); setError('') }}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex:2 }}>
                Next — Experience →
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Experience (Doctor only) */}
        {step === 3 && role === 'DOCTOR' && (
          <form onSubmit={submit}>
            <div style={{ fontWeight:700, marginBottom:16, color:'#2563eb', fontSize:14 }}>
              🏅 Experience & Profile
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
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
                <label className="form-label">About / Bio</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={set('bio')}
                  placeholder="Brief description of your expertise and experience…" />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:600 }}>
                <input type="checkbox" checked={form.onlineConsultation}
                  onChange={set('onlineConsultation')} style={{ width:18, height:18 }} />
                I offer online / video consultations
              </label>

              {/* Summary preview */}
              {form.specialty && (
                <div className="ai-box" style={{ marginTop:4 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'#2563eb', marginBottom:8 }}>📋 Profile Preview</div>
                  <div style={{ fontSize:14, lineHeight:1.8 }}>
                    <strong>{form.fullName || form.username}</strong> · {form.specialty}<br/>
                    {form.clinicName && <span>🏥 {form.clinicName} · </span>}
                    📍 {form.area ? `${form.area}, ` : ''}{form.city}<br/>
                    {form.experienceYears && <span>🏅 {form.experienceYears} yrs · </span>}
                    {form.consultationFee && <span>💰 ₹{form.consultationFee}</span>}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="button" className="btn btn-outline" style={{ flex:1 }}
                onClick={() => { setStep(2); setError('') }}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={loading}>
                {loading ? 'Creating Account…' : '✅ Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#64748b' }}>
          Already have an account?{' '}
          <button className="link-btn" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    </div>
  )
}
