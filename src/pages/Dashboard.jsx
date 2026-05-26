import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { statusBadge, SPECIALTY_ICONS } from '../components/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/appointments').then(r => setAppointments(r.data)).finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status)).slice(0,3)

  const patientActions = [
    { icon:'🔍', label:'Find Doctors',    path:'/find-doctors' },
    { icon:'🤖', label:'AI Symptom Check', path:'/symptom-check' },
    { icon:'📅', label:'My Appointments', path:'/appointments' },
  ]
  const doctorActions = [
    { icon:'📅', label:'My Appointments', path:'/appointments' },
    { icon:'✏️', label:'Edit Profile',    path:'/doctor/profile' },
    { icon:'🔍', label:'Find Doctors',    path:'/find-doctors' },
  ]
  const actions = user?.role === 'DOCTOR' ? doctorActions : patientActions

  return (
    <div className="page">
      <Navbar />

      {/* Hero header */}
      <div style={{ background:'linear-gradient(135deg,#1e40af,#3b82f6)', padding:'28px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'rgba(255,255,255,.7)', fontSize:14, marginBottom:2 }}>Good day,</div>
            <div style={{ color:'#fff', fontSize:26, fontWeight:800 }}>
              {user?.role === 'DOCTOR' ? 'Dr. ' : ''}{user?.fullName || user?.username}
            </div>
            <span className="badge" style={{ background:'rgba(255,255,255,.15)', color:'#fff', marginTop:8, display:'inline-flex' }}>
              {user?.role}
              {user?.role === 'DOCTOR' && user?.specialty && ` · ${user.specialty}`}
            </span>
          </div>
          <button className="btn btn-outline" onClick={logout}
            style={{ color:'#fff', borderColor:'rgba(255,255,255,.4)' }}>
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

        {/* Doctor profile completion prompt */}
        {user?.role === 'DOCTOR' && (!user?.city || !user?.specialty) && (
          <div className="ai-box" style={{ marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>⚠️ Complete Your Profile</div>
            <div style={{ fontSize:14, color:'#334155', marginBottom:12, lineHeight:1.6 }}>
              Patients search by city and specialty. Without these, you won't appear in search results.
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor/profile')}>
              Complete Profile →
            </button>
          </div>
        )}

        {/* Upcoming appointments */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : upcoming.length > 0 ? (
          <>
            <div className="section-header">
              <div className="section-title">Upcoming Appointments</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>View All</button>
            </div>
            {upcoming.map(a => (
              <div key={a.id} className="appt-card" style={{ cursor:'pointer', marginBottom:12 }}
                onClick={() => navigate(`/appointments/${a.id}`)}>
                <div className="appt-header">
                  <div>
                    <div className="appt-doctor">{user?.role==='PATIENT' ? a.doctorName : a.patientName}</div>
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
            ))}
          </>
        ) : (
          <div className="empty">
            <div className="empty-icon">{user?.role==='DOCTOR'?'🩺':'📋'}</div>
            <div className="empty-title">No appointments yet</div>
            <div style={{ marginBottom:16 }}>
              {user?.role==='PATIENT'
                ? 'Find a doctor and book your first appointment'
                : 'Complete your profile so patients can discover and book you'}
            </div>
            <button className="btn btn-primary"
              onClick={() => navigate(user?.role==='PATIENT' ? '/find-doctors' : '/doctor/profile')}>
              {user?.role==='PATIENT' ? '🔍 Find Doctors' : '✏️ Edit Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
