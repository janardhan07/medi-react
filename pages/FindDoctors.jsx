import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const SPECIALTY_ICONS = {
  'General Physician': '🩺', 'Cardiologist': '❤️', 'Neurologist': '🧠',
  'Ophthalmologist': '👁️', 'Gastroenterologist': '🫁', 'Dermatologist': '🧴',
  'Orthopedist': '🦴', 'ENT Specialist': '👂',
}

const ALL_SPECIALTIES = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Ophthalmologist',
  'Gastroenterologist', 'Dermatologist', 'Orthopedist', 'ENT Specialist',
]

const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ Rating' },
  { value: 'experience', label: '🏅 Experience' },
  { value: 'fee_asc', label: '💰 Fee: Low to High' },
  { value: 'fee_desc', label: '💰 Fee: High to Low' },
]

export default function FindDoctors() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const params = new URLSearchParams(location.search)

  const [city, setCity]           = useState(params.get('city') || '')
  const [specialty, setSpecialty] = useState(params.get('specialty') || '')
  const [sortBy, setSortBy]       = useState('rating')
  const [doctors, setDoctors]     = useState([])
  const [cities, setCities]       = useState([])
  const [loading, setLoading]     = useState(false)
  const [searched, setSearched]   = useState(false)

  // Load cities on mount
  useEffect(() => {
    api.get('/api/doctors/cities').then(r => setCities(r.data)).catch(() => {})
  }, [])

  // Auto-search if URL has params
  useEffect(() => {
    if (params.get('city') || params.get('specialty')) {
      handleSearch()
    }
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get('/api/doctors/search', {
        params: { city: city || undefined, specialty: specialty || undefined }
      })
      setDoctors(res.data)
    } catch {
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const sorted = [...doctors].sort((a, b) => {
    if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0)
    if (sortBy === 'fee_asc')    return (a.consultationFee || 0) - (b.consultationFee || 0)
    if (sortBy === 'fee_desc')   return (b.consultationFee || 0) - (a.consultationFee || 0)
    return 0
  })

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <button className="back-link" style={{ margin: 0 }} onClick={() => navigate('/dashboard')}>← Back</button>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Find Doctors</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="content" style={{ maxWidth: 800 }}>

        {/* Search Bar */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius)',
          padding: 20, boxShadow: 'var(--shadow-md)', marginBottom: 24,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="input-field-wrapper">
              <label className="input-label">📍 City / Location</label>
              <input
                className="input" value={city} onChange={e => setCity(e.target.value)}
                placeholder="Mumbai, Delhi, Bangalore…"
                list="cities-list"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <datalist id="cities-list">
                {cities.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="input-field-wrapper">
              <label className="input-label">🏥 Specialty</label>
              <select className="input" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                <option value="">All Specialties</option>
                {ALL_SPECIALTIES.map(s => (
                  <option key={s} value={s}>{SPECIALTY_ICONS[s]} {s}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" style={{ width: 'auto', padding: '14px 28px' }}
              onClick={handleSearch} disabled={loading}>
              {loading ? '…' : '🔍 Search'}
            </button>
          </div>
        </div>

        {/* Quick specialty chips */}
        {!searched && (
          <>
            <div className="section-title" style={{ marginBottom: 14 }}>Browse by Specialty</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
              {ALL_SPECIALTIES.map(sp => (
                <div key={sp} onClick={() => { setSpecialty(sp); setTimeout(handleSearch, 50) }}
                  style={{
                    background: 'var(--white)', borderRadius: 12, padding: '14px 12px',
                    textAlign: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)',
                    border: '1.5px solid var(--border)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{SPECIALTY_ICONS[sp]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>{sp}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Results */}
        {searched && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title">
                {loading ? 'Searching…' : `${sorted.length} doctor${sorted.length !== 1 ? 's' : ''} found`}
                {city && <span style={{ color: 'var(--text-gray)', fontWeight: 500, fontSize: 15 }}> in {city}</span>}
                {specialty && <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: 15 }}> · {specialty}</span>}
              </div>
              {sorted.length > 1 && (
                <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
                  value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </div>

            {loading ? (
              <div className="spinner-center"><div className="spinner" /></div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div>No doctors found{city ? ` in ${city}` : ''}{specialty ? ` for ${specialty}` : ''}.</div>
                <div style={{ marginTop: 8 }}>Try a different city or specialty.</div>
              </div>
            ) : (
              sorted.map(doc => (
                <DoctorCard key={doc.id} doctor={doc}
                  onSelect={() => navigate(`/doctors/${doc.id}`)} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

function DoctorCard({ doctor, onSelect }) {
  const stars = (rating) => {
    const full = Math.floor(rating || 0)
    const half = (rating || 0) - full >= 0.5
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
  }

  return (
    <div className="case-card" style={{ cursor: 'pointer' }} onClick={onSelect}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>
          {SPECIALTY_ICONS[doctor.specialty] || '🩺'}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Dr. {doctor.username}</div>
              <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 2 }}>
                {doctor.specialty || 'General Physician'}
              </div>
            </div>
            {doctor.available && (
              <span style={{
                background: 'var(--success-light)', color: 'var(--success)',
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              }}>Available</span>
            )}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>
              {stars(doctor.rating)}
            </span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{(doctor.rating || 0).toFixed(1)}</span>
            <span style={{ color: 'var(--text-gray)', fontSize: 13 }}>({doctor.ratingCount || 0} reviews)</span>
          </div>

          {/* Location + Experience */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
            {doctor.city && (
              <span style={{ fontSize: 13, color: 'var(--text-gray)' }}>
                📍 {doctor.city}
              </span>
            )}
            {doctor.experienceYears != null && (
              <span style={{ fontSize: 13, color: 'var(--text-gray)' }}>
                🏅 {doctor.experienceYears} yrs experience
              </span>
            )}
            {doctor.consultationFee != null && (
              <span style={{ fontSize: 13, color: 'var(--text-gray)' }}>
                💰 ₹{doctor.consultationFee} consultation
              </span>
            )}
          </div>

          {doctor.clinicAddress && (
            <div style={{ fontSize: 13, color: 'var(--text-gray)', marginTop: 4 }}>
              🏥 {doctor.clinicAddress}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
