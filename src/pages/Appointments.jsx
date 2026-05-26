import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { statusBadge, SPECIALTY_ICONS } from '../components/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Appointments() {
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
          {user?.role === 'PATIENT' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/find-doctors')}>
              + Book New
            </button>
          )}
        </div>

        <div className="tabs" style={{ marginBottom:20 }}>
          {['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s => (
            <button key={s} className={`tab ${filter===s?'active':''}`}
              onClick={() => setFilter(s)} style={{ fontSize:12 }}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No appointments</div>
            <div>{filter === 'ALL' ? 'Book your first appointment' : `No ${filter.toLowerCase()} appointments`}</div>
            {user?.role === 'PATIENT' && filter === 'ALL' && (
              <button className="btn btn-primary" style={{ marginTop:16 }}
                onClick={() => navigate('/find-doctors')}>
                Find Doctors
              </button>
            )}
          </div>
        ) : filtered.map(a => (
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
              {a.amount && <span className="appt-time-item">💰 ₹{a.amount}</span>}
            </div>
            {a.symptoms && (
              <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>
                Symptoms: {a.symptoms}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
