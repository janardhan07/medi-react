import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Stars, SPECIALTY_ICONS } from '../components/helpers'
import api from '../services/api'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()

  const [doctor,   setDoctor]   = useState(null)
  const [slots,    setSlots]    = useState([])
  const [form,     setForm]     = useState({
    appointmentDate: '', appointmentTime: '', symptoms: '', notes: '', consultType: 'IN_PERSON'
  })
  const [loading,  setLoading]  = useState(true)
  const [booking,  setBooking]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // Get next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1)
    return d.toISOString().split('T')[0]
  })

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })
  }

  useEffect(() => {
    api.get(`/api/doctors/${doctorId}`).then(r => setDoctor(r.data)).finally(() => setLoading(false))
  }, [doctorId])

  useEffect(() => {
    if (form.appointmentDate) {
      api.get('/api/appointments/slots', { params: { doctorId, date: form.appointmentDate } })
        .then(r => setSlots(r.data)).catch(() => setSlots([]))
    }
  }, [form.appointmentDate, doctorId])

  const handleBook = async () => {
    if (!form.appointmentDate) { setError('Please select a date.'); return }
    if (!form.appointmentTime) { setError('Please select a time slot.'); return }
    if (!form.symptoms.trim()) { setError('Please briefly describe your symptoms.'); return }
    setBooking(true); setError('')
    try {
      await api.post('/api/appointments', { doctorId: parseInt(doctorId), ...form })
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>

  if (success) return (
    <div className="page">
      <Navbar />
      <div style={{ maxWidth:500, margin:'80px auto', textAlign:'center', padding:24 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>✅</div>
        <div style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Appointment Booked!</div>
        <div style={{ color:'#64748b', marginBottom:8 }}>
          Your appointment with Dr. {doctor?.fullName||doctor?.username} on {formatDate(form.appointmentDate)} at {form.appointmentTime} has been confirmed.
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:28 }}>
          <button className="btn btn-primary" onClick={() => navigate('/appointments')}>View Appointments</button>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:680 }}>
        <button style={{ background:'none', border:'none', color:'#2563eb', fontWeight:600, cursor:'pointer', marginBottom:16 }}
          onClick={() => navigate(-1)}>← Back</button>

        {/* Doctor info */}
        {doctor && (
          <div className="card" style={{ marginBottom:20, display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
              {SPECIALTY_ICONS[doctor.specialty]||'🩺'}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:18 }}>Dr. {doctor.fullName||doctor.username}</div>
              <div style={{ color:'#2563eb', fontWeight:600, fontSize:14 }}>{doctor.specialty}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                <Stars rating={doctor.rating} size={13}/>
                <span style={{ fontSize:13, fontWeight:700 }}>{(doctor.rating||0).toFixed(1)}</span>
                {doctor.city && <span style={{ fontSize:12, color:'#64748b' }}>· 📍 {doctor.city}</span>}
                {doctor.experienceYears!=null && <span style={{ fontSize:12, color:'#64748b' }}>· {doctor.experienceYears} yrs</span>}
              </div>
              {doctor.consultationFee!=null && (
                <div style={{ marginTop:4, fontSize:14, fontWeight:700 }}>
                  Consultation Fee: <span style={{ color:'#2563eb' }}>₹{doctor.consultationFee}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}

        {/* Consult type */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Type of Consultation</div>
          <div style={{ display:'flex', gap:10 }}>
            {[['IN_PERSON','🏥 In-person Visit'],['ONLINE','📹 Online Consultation']].map(([v,l]) => (
              <button key={v} type="button"
                onClick={() => setForm(f=>({...f,consultType:v}))}
                className={`btn ${form.consultType===v?'btn-primary':'btn-outline'}`}
                style={{ flex:1 }}
                disabled={v==='ONLINE'&&!doctor?.onlineConsultation}>
                {l}
              </button>
            ))}
          </div>
          {!doctor?.onlineConsultation && <div style={{ fontSize:12, color:'#94a3b8', marginTop:8 }}>This doctor doesn't offer online consultations</div>}
        </div>

        {/* Date selection */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Select Date</div>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {dates.map(d => (
              <button key={d} type="button"
                onClick={() => setForm(f=>({...f,appointmentDate:d,appointmentTime:''}))}
                style={{
                  padding:'10px 16px', borderRadius:10, border:'1.5px solid',
                  borderColor: form.appointmentDate===d?'#2563eb':'#e2e8f0',
                  background: form.appointmentDate===d?'#2563eb':'#fff',
                  color: form.appointmentDate===d?'#fff':'#334155',
                  cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:13,
                  flexShrink:0, whiteSpace:'nowrap',
                }}>
                {formatDate(d)}
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        {form.appointmentDate && (
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, marginBottom:12 }}>
              Available Slots for {formatDate(form.appointmentDate)}
            </div>
            {slots.length === 0 ? (
              <div style={{ color:'#64748b', fontSize:14 }}>No slots available for this date. Please select another date.</div>
            ) : (
              <>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>Morning</div>
                <div className="slot-grid" style={{ marginBottom:16 }}>
                  {slots.filter(s=>parseInt(s)<12).map(s => (
                    <button key={s} className={`slot-btn ${form.appointmentTime===s?'selected':''}`}
                      onClick={() => setForm(f=>({...f,appointmentTime:s}))}>
                      {s}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>Afternoon / Evening</div>
                <div className="slot-grid">
                  {slots.filter(s=>parseInt(s)>=12).map(s => (
                    <button key={s} className={`slot-btn ${form.appointmentTime===s?'selected':''}`}
                      onClick={() => setForm(f=>({...f,appointmentTime:s}))}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Symptoms */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Your Symptoms *</div>
          <textarea className="form-input" rows={3} value={form.symptoms}
            onChange={e=>setForm(f=>({...f,symptoms:e.target.value}))}
            placeholder="Briefly describe what you're experiencing (e.g. chest pain for 2 days, headache, fever…)" />
          <div style={{ fontWeight:700, marginTop:14, marginBottom:8 }}>Additional Notes (optional)</div>
          <textarea className="form-input" rows={2} value={form.notes}
            onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Any other information the doctor should know…" />
        </div>

        {/* Summary */}
        {form.appointmentDate && form.appointmentTime && (
          <div className="ai-box" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, marginBottom:10 }}>📋 Booking Summary</div>
            <div style={{ fontSize:14, lineHeight:1.8 }}>
              <strong>Doctor:</strong> Dr. {doctor?.fullName||doctor?.username}<br/>
              <strong>Date:</strong> {formatDate(form.appointmentDate)} at {form.appointmentTime}<br/>
              <strong>Type:</strong> {form.consultType==='ONLINE'?'Online Consultation':'In-person Visit'}<br/>
              {doctor?.consultationFee!=null && <><strong>Fee:</strong> ₹{doctor.consultationFee}</>}
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={booking}>
          {booking ? 'Booking…' : '✅ Confirm Appointment'}
        </button>
      </div>
    </div>
  )
}
