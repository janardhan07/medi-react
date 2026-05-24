import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const SPECIALTY_ICONS = {
  'General Physician': '🩺', 'Cardiologist': '❤️', 'Neurologist': '🧠',
  'Ophthalmologist': '👁️', 'Gastroenterologist': '🫁', 'Dermatologist': '🧴',
  'Orthopedist': '🦴', 'ENT Specialist': '👂',
}

export default function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [doctor, setDoctor]   = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/api/doctors/${id}`),
      api.get(`/api/doctors/${id}/reviews`),
    ]).then(([docRes, revRes]) => {
      setDoctor(docRes.data)
      setReviews(revRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const submitReview = async () => {
    try {
      setSubmitting(true)
      await api.post(`/api/doctors/${id}/reviews`, reviewForm)
      const revRes = await api.get(`/api/doctors/${id}/reviews`)
      const docRes = await api.get(`/api/doctors/${id}`)
      setReviews(revRes.data)
      setDoctor(docRes.data)
      setShowReview(false)
      setReviewMsg('Review submitted successfully!')
      setTimeout(() => setReviewMsg(''), 3000)
    } catch {
      setReviewMsg('Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  const StarPicker = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} onClick={() => onChange(s)}
          style={{ fontSize: 28, cursor: 'pointer', color: s <= value ? '#f59e0b' : 'var(--border)' }}>
          ★
        </span>
      ))}
    </div>
  )

  if (loading) return <div className="spinner-center"><div className="spinner" /></div>
  if (!doctor) return <div className="empty-state"><div>Doctor not found.</div></div>

  const avgRating = (doctor.rating || 0).toFixed(1)
  const stars = Math.round(doctor.rating || 0)

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <button className="back-link" style={{ margin: 0 }} onClick={() => navigate(-1)}>← Back</button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Doctor Profile</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="content" style={{ maxWidth: 680 }}>

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--primary-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0,
            }}>
              {SPECIALTY_ICONS[doctor.specialty] || '🩺'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Dr. {doctor.username}</div>
              <div style={{ color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                {doctor.specialty || 'General Physician'}
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                {'★'.repeat(stars)}{'☆'.repeat(5 - stars) && (
                  <span style={{ color: '#f59e0b', fontSize: 18 }}>
                    {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                  </span>
                )}
                <span style={{ color: '#f59e0b', fontSize: 18 }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                <span style={{ fontWeight: 700 }}>{avgRating}</span>
                <span style={{ color: 'var(--text-gray)', fontSize: 13 }}>({doctor.ratingCount || 0} reviews)</span>
                {doctor.available && (
                  <span style={{
                    background: 'var(--success-light)', color: 'var(--success)',
                    fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  }}>✓ Available</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12, margin: '16px 0', textAlign: 'center',
          }}>
            {[
              { icon: '🏅', label: 'Experience', value: doctor.experienceYears != null ? `${doctor.experienceYears} yrs` : '—' },
              { icon: '💰', label: 'Consultation', value: doctor.consultationFee != null ? `₹${doctor.consultationFee}` : '—' },
              { icon: '⭐', label: 'Rating', value: avgRating + ' / 5' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--bg)', borderRadius: 12, padding: '14px 10px',
              }}>
                <div style={{ fontSize: 22 }}>{stat.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Location */}
          {(doctor.city || doctor.clinicAddress) && (
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              {doctor.city && (
                <div style={{ fontSize: 14, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>📍 City:</span> {doctor.city}
                </div>
              )}
              {doctor.clinicAddress && (
                <div style={{ fontSize: 14, color: 'var(--text-gray)' }}>
                  🏥 {doctor.clinicAddress}
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          {doctor.bio && (
            <div style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 16 }}>
              {doctor.bio}
            </div>
          )}

          {/* Book button — only for logged-in patients */}
          {user?.role === 'PATIENT' && (
            <button className="btn btn-primary"
              onClick={() => navigate('/new-case', { state: { preselectedDoctorId: doctor.id, preselectedDoctorName: doctor.username } })}>
              📋 Book Consultation with Dr. {doctor.username}
            </button>
          )}
          {!user && (
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Login to Book Consultation
            </button>
          )}
        </div>

        {/* Reviews Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-title">Reviews ({reviews.length})</div>
          {user?.role === 'PATIENT' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(!showReview)}>
              {showReview ? 'Cancel' : '✍️ Write Review'}
            </button>
          )}
        </div>

        {reviewMsg && (
          <div className={`alert ${reviewMsg.includes('success') ? 'alert-success' : 'alert-error'}`}
            style={{ marginBottom: 16 }}>
            {reviewMsg}
          </div>
        )}

        {/* Review form */}
        {showReview && (
          <div className="card" style={{ marginBottom: 16, border: '1.5px solid var(--primary)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Your Review</div>
            <StarPicker value={reviewForm.rating} onChange={r => setReviewForm({ ...reviewForm, rating: r })} />
            <textarea className="input" style={{ marginTop: 12 }}
              value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience with this doctor…"
              rows={3}
            />
            <button className="btn btn-primary" style={{ marginTop: 12 }}
              onClick={submitReview} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div>No reviews yet. Be the first to review!</div>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{r.patientUsername}</span>
                <span style={{ color: '#f59e0b', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <div style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.5 }}>{r.comment}</div>}
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 6 }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
