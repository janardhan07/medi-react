import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { SPECIALTY_ICONS, ALL_SPECIALTIES, INDIAN_CITIES } from '../components/helpers'

export default function Home() {
  const navigate = useNavigate()
  const [city, setCity]           = useState('')
  const [specialty, setSpecialty] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city)      params.set('city', city)
    if (specialty) params.set('specialty', specialty)
    navigate('/find-doctors?' + params.toString())
  }

  return (
    <div className="page">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="hero-title">Your Health, Our Priority</div>
          <div className="hero-sub">Find the best doctors near you · Book appointments instantly · Get AI-powered health guidance</div>

          <div className="search-bar" style={{ maxWidth: 700, margin: '0 auto' }}>
            <select className="search-field" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">📍 Select City</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="search-field" value={specialty} onChange={e => setSpecialty(e.target.value)}>
              <option value="">🏥 Select Specialty</option>
              {ALL_SPECIALTIES.map(s => <option key={s} value={s}>{SPECIALTY_ICONS[s]} {s}</option>)}
            </select>
            <button className="search-btn" onClick={handleSearch}>Search Doctors</button>
          </div>
        </div>
      </div>

      {/* ── AI Symptom Checker Banner ────────────────────── */}
      <div className="container" style={{ marginTop: -20 }}>
        <div style={{
          background: 'linear-gradient(135deg,#0f172a,#1e40af)',
          borderRadius: 20, padding: '24px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 6 }}>
              🤖 Powered by AI
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Not sure which doctor to see?</div>
            <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
              Describe your symptoms and our AI instantly tells you which specialist you need
            </div>
          </div>
          <button className="btn btn-lg" style={{ background: '#fff', color: '#1e40af', fontWeight: 800, flexShrink: 0 }}
            onClick={() => navigate('/symptom-check')}>
            Check Symptoms →
          </button>
        </div>
      </div>

      {/* ── Browse by Specialty ──────────────────────────── */}
      <div className="container" style={{ marginTop: 48 }}>
        <div className="section-title" style={{ textAlign: 'center', marginBottom: 24, fontSize: 24 }}>
          Browse by Specialty
        </div>
        <div className="specialty-grid">
          {ALL_SPECIALTIES.map(sp => (
            <div key={sp} className="specialty-chip"
              onClick={() => navigate(`/find-doctors?specialty=${encodeURIComponent(sp)}`)}>
              <div className="specialty-chip-icon">{SPECIALTY_ICONS[sp]}</div>
              <div className="specialty-chip-label">{sp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <div style={{ background: "#f1f5f9", marginTop: 56, padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-title" style={{ fontSize: 24, marginBottom: 36 }}>How It Works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {[
              { icon: '🔍', title: 'Search Doctors', desc: 'Find top-rated doctors by city, specialty, or symptom checker' },
              { icon: '📅', title: 'Book Appointment', desc: 'Pick your preferred time slot and confirm instantly' },
              { icon: '🩺', title: 'Get Consultation', desc: 'Visit the clinic or consult online — your choice' },
            ].map(s => (
              <div key={s.title} style={{ padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popular Cities ────────────────────────────────── */}
      <div className="container" style={{ marginTop: 48, marginBottom: 60 }}>
        <div className="section-title" style={{ fontSize: 24, textAlign: 'center', marginBottom: 24 }}>Find Doctors in Your City</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {INDIAN_CITIES.slice(0, 10).map(c => (
            <button key={c} onClick={() => navigate(`/find-doctors?city=${c}`)}
              style={{
                padding: '10px 20px', borderRadius: 20, border: '1.5px solid #e2e8f0',
                background: '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                fontSize: 14, fontWeight: 600, color: '#334155', transition: 'all .15s',
              }}>
              📍 {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Workaround for var inside JSX
