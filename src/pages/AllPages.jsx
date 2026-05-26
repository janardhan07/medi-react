import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { statusBadge, SPECIALTY_ICONS } from '../components/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ─── Appointments List ────────────────────────────────────────────────────────
export function Appointments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get('/api/appointments').then(r => setAppointments(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontSize:24, fontWeight:800 }}>My Appointments</div>
          {user?.role==='PATIENT' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/find-doctors')}>
              + Book New
            </button>
          )}
        </div>

        <div className="tabs" style={{ marginBottom:20 }}>
          {['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s => (
            <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}
              style={{ fontSize:12 }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner"/></div>
        : filtered.length===0 ? (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No appointments</div>
            <div>{ filter==='ALL'?'Book your first appointment':'No '+filter.toLowerCase()+' appointments' }</div>
            {user?.role==='PATIENT' && filter==='ALL' && (
              <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/find-doctors')}>
                Find Doctors
              </button>
            )}
          </div>
        ) : filtered.map(a => (
          <div key={a.id} className="appt-card" onClick={() => navigate(`/appointments/${a.id}`)}
            style={{ cursor:'pointer' }}>
            <div className="appt-header">
              <div>
                <div className="appt-doctor">
                  {user?.role==='PATIENT' ? a.doctorName : a.patientName}
                </div>
                <div className="appt-specialty">
                  {SPECIALTY_ICONS[a.doctorSpecialty]||'🩺'} {a.doctorSpecialty}
                </div>
              </div>
              {statusBadge(a.status)}
            </div>
            <div className="appt-time">
              <span className="appt-time-item">📅 {new Date(a.appointmentDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</span>
              <span className="appt-time-item">🕐 {a.appointmentTime}</span>
              <span className="appt-time-item">{a.consultType==='ONLINE'?'📹 Online':'🏥 In-person'}</span>
              {a.amount && <span className="appt-time-item">💰 ₹{a.amount}</span>}
            </div>
            {a.symptoms && <div style={{ fontSize:13, color:'#64748b' }}>Symptoms: {a.symptoms}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Appointment Detail ───────────────────────────────────────────────────────
export function AppointmentDetail() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const id = window.location.pathname.split('/').pop()
  const [appt, setAppt] = useState(null)
  const [form, setForm] = useState({ doctorNotes:'', prescription:'', status:'' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get(`/api/appointments/${id}`).then(r => {
      setAppt(r.data)
      setForm(f => ({ ...f, status: r.data.status, doctorNotes: r.data.doctorNotes||'', prescription: r.data.prescription||'' }))
    }).finally(() => setLoading(false))
  }, [id])

  const update = async () => {
    setSaving(true); setMsg('')
    try {
      await api.patch(`/api/appointments/${id}/status`, form)
      setMsg('✅ Updated successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Update failed.') }
    finally { setSaving(false) }
  }

  const cancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return
    await api.patch(`/api/appointments/${id}/cancel`)
    navigate('/appointments')
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!appt)   return <div className="empty"><div>Appointment not found</div></div>

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:640 }}>
        <button style={{ background:'none', border:'none', color:'#2563eb', fontWeight:600, cursor:'pointer', marginBottom:16 }}
          onClick={() => navigate('/appointments')}>← Back</button>

        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Appointment Details</div>
            {statusBadge(appt.status)}
          </div>
          {[
            ['👨‍⚕️ Doctor', appt.doctorName + (appt.doctorSpecialty ? ` · ${appt.doctorSpecialty}` : '')],
            ['🧑 Patient', appt.patientName],
            ['📅 Date', new Date(appt.appointmentDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})],
            ['🕐 Time', appt.appointmentTime],
            ['📍 Location', appt.doctorCity||'—'],
            ['🏥 Type', appt.consultType==='ONLINE'?'Online Consultation':'In-person Visit'],
            ['💰 Fee', appt.amount?`₹${appt.amount}`:'—'],
          ].filter(([,v])=>v&&v!=='undefined').map(([label,val]) => (
            <div key={label} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontSize:14, color:'#64748b', minWidth:130 }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:600 }}>{val}</span>
            </div>
          ))}
          {appt.symptoms && (
            <div style={{ marginTop:12, padding:12, background:'#f8fafc', borderRadius:10 }}>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>Symptoms reported</div>
              <div style={{ fontSize:14 }}>{appt.symptoms}</div>
            </div>
          )}
        </div>

        {/* Doctor actions */}
        {user?.role==='DOCTOR' && appt.status!=='CANCELLED' && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, marginBottom:14 }}>Update Appointment</div>
            {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{ marginBottom:14 }}>{msg}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  {['PENDING','CONFIRMED','COMPLETED'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor Notes</label>
                <textarea className="form-input" rows={3} value={form.doctorNotes}
                  onChange={e=>setForm(f=>({...f,doctorNotes:e.target.value}))}
                  placeholder="Diagnosis, observations…" />
              </div>
              <div className="form-group">
                <label className="form-label">Prescription</label>
                <textarea className="form-input" rows={4} value={form.prescription}
                  onChange={e=>setForm(f=>({...f,prescription:e.target.value}))}
                  placeholder="Medicine name, dosage, duration…" />
              </div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop:16 }} onClick={update} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Prescription display */}
        {appt.prescription && (
          <div className="card" style={{ marginBottom:16, border:'1.5px solid #16a34a' }}>
            <div style={{ fontWeight:700, color:'#16a34a', marginBottom:8 }}>📋 Prescription</div>
            <div style={{ fontSize:14, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{appt.prescription}</div>
          </div>
        )}

        {appt.doctorNotes && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, marginBottom:8 }}>📝 Doctor Notes</div>
            <div style={{ fontSize:14, lineHeight:1.7 }}>{appt.doctorNotes}</div>
          </div>
        )}

        {user?.role==='PATIENT' && appt.status==='PENDING' && (
          <button className="btn btn-danger btn-full" onClick={cancel}>Cancel Appointment</button>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/appointments').then(r => setAppointments(r.data)).finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status)).slice(0, 3)
  const recent   = appointments.filter(a => ['COMPLETED','CANCELLED'].includes(a.status)).slice(0, 3)

  const patientActions = [
    { icon:'🔍', label:'Find Doctors',     path:'/find-doctors' },
    { icon:'🤖', label:'AI Checker',        path:'/symptom-check' },
    { icon:'📅', label:'My Appointments',  path:'/appointments' },
  ]
  const doctorActions = [
    { icon:'📅', label:'My Appointments',  path:'/appointments' },
    { icon:'✏️', label:'Edit Profile',      path:'/doctor/profile' },
    { icon:'🔍', label:'Find Doctors',     path:'/find-doctors' },
  ]
  const actions = user?.role==='DOCTOR' ? doctorActions : patientActions

  return (
    <div className="page">
      <Navbar />
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e40af,#3b82f6)', padding:'24px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'rgba(255,255,255,.7)', fontSize:14 }}>Good day,</div>
            <div style={{ color:'#fff', fontSize:24, fontWeight:800 }}>
              {user?.role==='DOCTOR'?'Dr. ':''}{user?.fullName||user?.username}
            </div>
            <span className="badge" style={{ background:'rgba(255,255,255,.2)', color:'#fff', marginTop:6, display:'inline-flex' }}>
              {user?.role}
            </span>
          </div>
          <button className="btn btn-outline" onClick={logout} style={{ color:'#fff', borderColor:'rgba(255,255,255,.4)' }}>
            Logout
          </button>
        </div>
      </div>

      <div className="content-wrap">
        {/* Quick actions */}
        <div className="quick-actions" style={{ marginBottom:28 }}>
          {actions.map(a => (
            <div key={a.label} className="quick-action" onClick={() => navigate(a.path)}>
              <div className="quick-action-icon">{a.icon}</div>
              <div className="quick-action-label">{a.label}</div>
            </div>
          ))}
        </div>

        {/* Doctor profile prompt */}
        {user?.role==='DOCTOR' && (!user?.city || !user?.specialty) && (
          <div className="ai-box" style={{ marginBottom:20 }}>
            <div style={{ fontWeight:700, marginBottom:6 }}>⚠️ Complete Your Profile</div>
            <div style={{ fontSize:14, color:'#64748b', marginBottom:12 }}>
              Patients can't find you without your city and specialty. Add your profile details now.
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor/profile')}>
              Complete Profile →
            </button>
          </div>
        )}

        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
          <>
            {upcoming.length > 0 && (
              <>
                <div className="section-header">
                  <div className="section-title">Upcoming Appointments</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>View All</button>
                </div>
                {upcoming.map(a => <MiniApptCard key={a.id} a={a} user={user} onClick={() => navigate(`/appointments/${a.id}`)} />)}
              </>
            )}

            {appointments.length === 0 && (
              <div className="empty">
                <div className="empty-icon">{user?.role==='DOCTOR'?'🩺':'📋'}</div>
                <div className="empty-title">No appointments yet</div>
                <div>{user?.role==='PATIENT'?'Find a doctor and book your first appointment':'Complete your profile so patients can discover you'}</div>
                <button className="btn btn-primary" style={{ marginTop:16 }}
                  onClick={() => navigate(user?.role==='PATIENT'?'/find-doctors':'/doctor/profile')}>
                  {user?.role==='PATIENT'?'🔍 Find Doctors':'✏️ Edit Profile'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MiniApptCard({ a, user, onClick }) {
  return (
    <div className="appt-card" onClick={onClick} style={{ cursor:'pointer', marginBottom:12 }}>
      <div className="appt-header">
        <div>
          <div className="appt-doctor">{user?.role==='PATIENT'?a.doctorName:a.patientName}</div>
          <div className="appt-specialty">{SPECIALTY_ICONS[a.doctorSpecialty]||'🩺'} {a.doctorSpecialty}</div>
        </div>
        {statusBadge(a.status)}
      </div>
      <div className="appt-time">
        <span className="appt-time-item">📅 {new Date(a.appointmentDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</span>
        <span className="appt-time-item">🕐 {a.appointmentTime}</span>
        <span className="appt-time-item">{a.consultType==='ONLINE'?'📹 Online':'🏥 In-person'}</span>
      </div>
    </div>
  )
}

// ─── Doctor Profile Edit ──────────────────────────────────────────────────────
export function DoctorProfileEdit() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: user?.fullName||'', gender: user?.gender||'', phoneNumber: user?.phoneNumber||'',
    specialty: user?.specialty||'', city: user?.city||'', area: user?.area||'',
    clinicName: user?.clinicName||'', clinicAddress: user?.clinicAddress||'',
    experienceYears: user?.experienceYears||'', consultationFee: user?.consultationFee||'',
    bio: user?.bio||'', qualifications: user?.qualifications||'', languages: user?.languages||'',
    available: user?.available!==false, onlineConsultation: user?.onlineConsultation||false,
  })
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')
  const { ALL_SPECIALTIES, SPECIALTY_ICONS, INDIAN_CITIES } = require('../components/helpers')

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type==='checkbox'?e.target.checked:e.target.value }))

  const save = async e => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      const res = await api.put('/api/doctors/profile', {
        ...form,
        experienceYears: form.experienceYears?parseInt(form.experienceYears):null,
        consultationFee: form.consultationFee?parseInt(form.consultationFee):null,
      })
      updateUser({ ...user, ...res.data })
      setMsg('✅ Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Update failed.') }
    finally { setLoading(false) }
  }

  if (user?.role !== 'DOCTOR') return <div className="empty"><div>Only doctors can access this page.</div></div>

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:600 }}>
        <button style={{ background:'none', border:'none', color:'#2563eb', fontWeight:600, cursor:'pointer', marginBottom:16 }}
          onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <div style={{ fontSize:24, fontWeight:800, marginBottom:6 }}>Edit Profile</div>
        <div style={{ color:'#64748b', marginBottom:24 }}>Keep your profile updated so patients can find and trust you.</div>

        {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{ marginBottom:20 }}>{msg}</div>}

        <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div style={{ fontWeight:700, marginBottom:14 }}>Personal Info</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Full Name</label>
                  <input className="form-input" value={form.fullName} onChange={set('fullName')} placeholder="Dr. Rajesh Kumar"/></div>
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={set('gender')}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select></div>
              </div>
              <div className="form-group"><label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+91 98765 43210"/></div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight:700, marginBottom:14 }}>Practice Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Specialty</label>
                <select className="form-input" value={form.specialty} onChange={set('specialty')}>
                  <option value="">Select specialty</option>
                  {ALL_SPECIALTIES.map(s=><option key={s} value={s}>{SPECIALTY_ICONS[s]} {s}</option>)}
                </select></div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">City</label>
                  <select className="form-input" value={form.city} onChange={set('city')}>
                    <option value="">Select city</option>
                    {INDIAN_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Area / Locality</label>
                  <input className="form-input" value={form.area} onChange={set('area')} placeholder="Koramangala, Andheri…"/></div>
              </div>
              <div className="form-group"><label className="form-label">Clinic Name</label>
                <input className="form-input" value={form.clinicName} onChange={set('clinicName')} placeholder="Apollo Clinic"/></div>
              <div className="form-group"><label className="form-label">Clinic Address</label>
                <input className="form-input" value={form.clinicAddress} onChange={set('clinicAddress')} placeholder="123 MG Road, Mumbai 400001"/></div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" min="0" value={form.experienceYears} onChange={set('experienceYears')}/></div>
                <div className="form-group"><label className="form-label">Consultation Fee (₹)</label>
                  <input className="form-input" type="number" min="0" value={form.consultationFee} onChange={set('consultationFee')}/></div>
              </div>
              <div className="form-group"><label className="form-label">Qualifications</label>
                <input className="form-input" value={form.qualifications} onChange={set('qualifications')} placeholder="MBBS, MD Cardiology, AIIMS"/></div>
              <div className="form-group"><label className="form-label">Languages</label>
                <input className="form-input" value={form.languages} onChange={set('languages')} placeholder="English, Hindi, Tamil"/></div>
              <div className="form-group"><label className="form-label">Bio</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={set('bio')} placeholder="About your practice…"/></div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:600 }}>
                  <input type="checkbox" checked={form.available} onChange={set('available')} style={{ width:18, height:18 }}/>
                  Accepting new patients
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:600 }}>
                  <input type="checkbox" checked={form.onlineConsultation} onChange={set('onlineConsultation')} style={{ width:18, height:18 }}/>
                  Offer online / video consultations
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
