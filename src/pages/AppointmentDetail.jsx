import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { statusBadge } from '../components/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appt,    setAppt]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [form,    setForm]    = useState({ status:'', doctorNotes:'', prescription:'' })

  useEffect(() => {
    api.get(`/api/appointments/${id}`).then(r => {
      setAppt(r.data)
      setForm({ status: r.data.status, doctorNotes: r.data.doctorNotes||'', prescription: r.data.prescription||'' })
    }).finally(() => setLoading(false))
  }, [id])

  const update = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await api.patch(`/api/appointments/${id}/status`, form)
      setAppt(res.data)
      setMsg('✅ Updated successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Update failed. Please try again.') }
    finally { setSaving(false) }
  }

  const cancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return
    await api.patch(`/api/appointments/${id}/cancel`)
    navigate('/appointments')
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!appt)   return <div className="empty"><div className="empty-icon">🔍</div><div>Appointment not found</div></div>

  const dateStr = new Date(appt.appointmentDate+'T00:00:00')
    .toLocaleDateString('en-IN',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:640 }}>
        <button style={{ background:'none', border:'none', color:'#2563eb', fontWeight:600, cursor:'pointer', marginBottom:16 }}
          onClick={() => navigate('/appointments')}>← Back to Appointments</button>

        {/* Main details */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Appointment Details</div>
            {statusBadge(appt.status)}
          </div>
          {[
            ['👨‍⚕️', 'Doctor',    appt.doctorName + (appt.doctorSpecialty ? ` · ${appt.doctorSpecialty}` : '')],
            ['🧑',  'Patient',   appt.patientName],
            ['📅',  'Date',      dateStr],
            ['🕐',  'Time',      appt.appointmentTime],
            ['📍',  'City',      appt.doctorCity],
            ['🏥',  'Type',      appt.consultType==='ONLINE'?'Online Consultation':'In-person Visit'],
            ['💰',  'Fee',       appt.amount ? `₹${appt.amount}` : null],
          ].filter(([,,v]) => v).map(([icon,label,val]) => (
            <div key={label} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontSize:18 }}>{icon}</span>
              <span style={{ fontSize:14, color:'#64748b', width:100, flexShrink:0 }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:600, flex:1 }}>{val}</span>
            </div>
          ))}
          {appt.symptoms && (
            <div style={{ marginTop:14, padding:14, background:'#f8fafc', borderRadius:10 }}>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:600, marginBottom:4 }}>SYMPTOMS REPORTED</div>
              <div style={{ fontSize:14 }}>{appt.symptoms}</div>
            </div>
          )}
          {appt.notes && (
            <div style={{ marginTop:10, padding:14, background:'#f8fafc', borderRadius:10 }}>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:600, marginBottom:4 }}>PATIENT NOTES</div>
              <div style={{ fontSize:14 }}>{appt.notes}</div>
            </div>
          )}
        </div>

        {/* Doctor notes & prescription (view) */}
        {appt.doctorNotes && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, marginBottom:8 }}>📝 Doctor Notes</div>
            <div style={{ fontSize:14, lineHeight:1.7 }}>{appt.doctorNotes}</div>
          </div>
        )}

        {appt.prescription && (
          <div className="card" style={{ marginBottom:16, border:'2px solid #16a34a' }}>
            <div style={{ fontWeight:700, color:'#16a34a', marginBottom:8 }}>📋 Prescription</div>
            <div style={{ fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'monospace', background:'#f8fafc', padding:12, borderRadius:8 }}>
              {appt.prescription}
            </div>
          </div>
        )}

        {/* Doctor update form */}
        {user?.role === 'DOCTOR' && appt.status !== 'CANCELLED' && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>Update Appointment</div>
            {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{ marginBottom:14 }}>{msg}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status}
                  onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor Notes / Diagnosis</label>
                <textarea className="form-input" rows={3} value={form.doctorNotes}
                  onChange={e => setForm(f=>({...f,doctorNotes:e.target.value}))}
                  placeholder="Diagnosis, observations, instructions…" />
              </div>
              <div className="form-group">
                <label className="form-label">Prescription</label>
                <textarea className="form-input" rows={5} value={form.prescription}
                  onChange={e => setForm(f=>({...f,prescription:e.target.value}))}
                  placeholder="Tab. Paracetamol 500mg – twice daily for 3 days&#10;Tab. Cetirizine 10mg – once daily at night&#10;…" />
              </div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop:16 }}
              onClick={update} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        )}

        {/* Patient cancel */}
        {user?.role === 'PATIENT' && ['PENDING','CONFIRMED'].includes(appt.status) && (
          <button className="btn btn-danger btn-full" onClick={cancel}>
            Cancel Appointment
          </button>
        )}
      </div>
    </div>
  )
}
