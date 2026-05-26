// DoctorProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Stars, StarPicker, SPECIALTY_ICONS } from '../components/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor,  setDoctor]  = useState(null)
  const [reviews, setReviews] = useState([])
  const [tab,     setTab]     = useState('about')
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating:5, comment:'' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => Promise.all([
    api.get(`/api/doctors/${id}`),
    api.get(`/api/doctors/${id}/reviews`),
  ]).then(([d,r]) => { setDoctor(d.data); setReviews(r.data) }).finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const submitReview = async () => {
    try {
      setSubmitting(true)
      await api.post(`/api/doctors/${id}/reviews`, reviewForm)
      await load()
      setShowReviewForm(false)
      setMsg('✅ Review submitted!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setMsg('❌ Failed to submit review.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!doctor) return <div className="empty"><div className="empty-icon">🔍</div><div>Doctor not found</div></div>

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:700 }}>
        <button style={{ background:'none', border:'none', color:'#2563eb', fontWeight:600, cursor:'pointer', marginBottom:16 }}
          onClick={() => navigate(-1)}>← Back</button>

        {/* Profile hero */}
        <div className="card" style={{ marginBottom:16, overflow:'hidden', padding:0 }}>
          <div style={{ background:'linear-gradient(135deg,#1e40af,#3b82f6)', height:80 }}/>
          <div style={{ padding:'0 24px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:-40 }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'#fff', border:'4px solid #fff',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:'0 4px 12px rgba(0,0,0,.12)' }}>
                {SPECIALTY_ICONS[doctor.specialty]||'🩺'}
              </div>
              {doctor.available && <span className="badge badge-green">✓ Available</span>}
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:24, fontWeight:800 }}>Dr. {doctor.fullName||doctor.username}</div>
              <div style={{ color:'#2563eb', fontWeight:600, fontSize:15, marginTop:2 }}>{doctor.specialty}</div>
              {doctor.qualifications && <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>{doctor.qualifications}</div>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, margin:'20px 0' }}>
              {[
                { icon:'⭐', val:`${(doctor.rating||0).toFixed(1)}/5`, sub:`${doctor.ratingCount||0} reviews` },
                { icon:'🏅', val: doctor.experienceYears!=null?`${doctor.experienceYears} yrs`:'—', sub:'Experience' },
                { icon:'💰', val: doctor.consultationFee!=null?`₹${doctor.consultationFee}`:'—', sub:'Per visit' },
              ].map(s => (
                <div key={s.sub} style={{ background:'#f8fafc', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:22 }}>{s.icon}</div>
                  <div style={{ fontWeight:800, fontSize:17, marginTop:4 }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            {user?.role==='PATIENT' ? (
              <button className="btn btn-primary btn-full"
                onClick={() => navigate(`/book/${doctor.id}`)}>
                📅 Book Appointment — {doctor.consultationFee!=null?`₹${doctor.consultationFee}`:''}
              </button>
            ) : !user ? (
              <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
                Login to Book Appointment
              </button>
            ) : null}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['about','reviews'].map(t => (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t==='about'?'📄 About':`⭐ Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {tab==='about' && (
          <div className="card">
            <div style={{ fontWeight:700, fontSize:17, marginBottom:14 }}>About</div>
            {doctor.bio ? <div style={{ fontSize:14, lineHeight:1.7, color:'#334155', marginBottom:16 }}>{doctor.bio}</div>
              : <div style={{ color:'#94a3b8', fontSize:14, marginBottom:16 }}>No bio provided.</div>}
            <div className="divider"/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                ['🏥','Specialty',doctor.specialty],
                ['📍','Location',doctor.area?`${doctor.area}, ${doctor.city}`:doctor.city],
                ['🏢','Clinic',doctor.clinicName],
                ['📍','Address',doctor.clinicAddress],
                ['🗣','Languages',doctor.languages],
                ['📞','Phone',doctor.phoneNumber],
                ['📹','Online Consult',doctor.onlineConsultation?'Available':'Not available'],
              ].filter(f=>f[2]).map(([icon,label,val]) => (
                <div key={label} style={{ background:'#f8fafc', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:3 }}>{icon} {label}</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='reviews' && (
          <div>
            {/* Rating summary */}
            <div className="card" style={{ marginBottom:14, display:'flex', gap:24, alignItems:'center' }}>
              <div style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontSize:52, fontWeight:800, lineHeight:1 }}>{(doctor.rating||0).toFixed(1)}</div>
                <Stars rating={doctor.rating} size={18}/>
                <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{doctor.ratingCount||0} reviews</div>
              </div>
              <div style={{ flex:1 }}>
                {[5,4,3,2,1].map(star => {
                  const cnt = reviews.filter(r=>r.rating===star).length
                  const pct = reviews.length ? Math.round(cnt/reviews.length*100) : 0
                  return (
                    <div key={star} className="rating-bar-row">
                      <span style={{ fontSize:12, width:10 }}>{star}</span>
                      <span style={{ color:'#f59e0b', fontSize:12 }}>★</span>
                      <div className="rating-bar-track">
                        <div className="rating-bar-fill" style={{ width:`${pct}%` }}/>
                      </div>
                      <span style={{ fontSize:12, color:'#94a3b8', width:24 }}>{cnt}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{ marginBottom:14 }}>{msg}</div>}

            {user?.role==='PATIENT' && (
              <div style={{ marginBottom:16 }}>
                {!showReviewForm ? (
                  <button className="btn btn-secondary" onClick={() => setShowReviewForm(true)}>✍️ Write a Review</button>
                ) : (
                  <div className="card" style={{ border:'2px solid #2563eb' }}>
                    <div style={{ fontWeight:700, marginBottom:12 }}>Your Rating</div>
                    <StarPicker value={reviewForm.rating} onChange={r=>setReviewForm(f=>({...f,rating:r}))}/>
                    <textarea className="form-input" rows={4} style={{ marginTop:12 }}
                      value={reviewForm.comment}
                      onChange={e=>setReviewForm(f=>({...f,comment:e.target.value}))}
                      placeholder="Share your experience with this doctor…"/>
                    <div style={{ display:'flex', gap:10, marginTop:12 }}>
                      <button className="btn btn-outline" style={{ flex:1 }} onClick={()=>setShowReviewForm(false)}>Cancel</button>
                      <button className="btn btn-primary" style={{ flex:2 }} onClick={submitReview} disabled={submitting}>
                        {submitting?'Submitting…':'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {reviews.length===0 ? (
              <div className="empty" style={{ padding:32 }}>
                <div className="empty-icon">💬</div><div>No reviews yet.</div>
              </div>
            ) : reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <span className="review-author">{r.patientName||r.patientUsername}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Stars rating={r.rating} size={14}/>
                    <span className="review-date">{r.createdAt?new Date(r.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}):''}</span>
                  </div>
                </div>
                {r.comment && <div className="review-text">{r.comment}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
