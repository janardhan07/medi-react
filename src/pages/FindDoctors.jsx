import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Stars, SPECIALTY_ICONS, ALL_SPECIALTIES, INDIAN_CITIES } from '../components/helpers'
import api from '../services/api'

export default function FindDoctors() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [city,      setCity]      = useState(searchParams.get('city')      || '')
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '')
  const [area,      setArea]      = useState(searchParams.get('area')      || '')
  const [sortBy,    setSortBy]    = useState('rating')
  const [maxFee,    setMaxFee]    = useState('')
  const [minExp,    setMinExp]    = useState('')
  const [onlineOnly,setOnlineOnly]= useState(false)
  const [doctors,   setDoctors]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [searched,  setSearched]  = useState(false)

  useEffect(() => {
    if (searchParams.get('city') || searchParams.get('specialty')) doSearch()
  }, [])

  const doSearch = async () => {
    setLoading(true); setSearched(true)
    try {
      const res = await api.get('/api/doctors/search', {
        params: { city: city||undefined, specialty: specialty||undefined, area: area||undefined }
      })
      setDoctors(res.data)
    } catch { setDoctors([]) }
    finally { setLoading(false) }
  }

  const handleSearch = () => {
    const p = {}
    if (city)      p.city      = city
    if (specialty) p.specialty = specialty
    if (area)      p.area      = area
    setSearchParams(p)
    doSearch()
  }

  const filtered = doctors
    .filter(d => !maxFee    || (d.consultationFee != null && d.consultationFee <= parseInt(maxFee)))
    .filter(d => !minExp    || (d.experienceYears != null && d.experienceYears >= parseInt(minExp)))
    .filter(d => !onlineOnly || d.onlineConsultation)
    .sort((a,b) => {
      if (sortBy==='rating') return (b.rating||0)-(a.rating||0)
      if (sortBy==='exp')    return (b.experienceYears||0)-(a.experienceYears||0)
      if (sortBy==='fee_lo') return (a.consultationFee||9999)-(b.consultationFee||9999)
      if (sortBy==='fee_hi') return (b.consultationFee||0)-(a.consultationFee||0)
      return 0
    })

  return (
    <div className="page">
      <Navbar />

      {/* Search bar */}
      <div style={{ background:'#2563eb', padding:'20px 0' }}>
        <div className="container">
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <select value={city} onChange={e=>setCity(e.target.value)}
              style={{ flex:'1 1 180px', padding:'12px 14px', borderRadius:10, border:'none', fontSize:14, outline:'none' }}>
              <option value="">📍 All Cities</option>
              {INDIAN_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={specialty} onChange={e=>setSpecialty(e.target.value)}
              style={{ flex:'1 1 180px', padding:'12px 14px', borderRadius:10, border:'none', fontSize:14, outline:'none' }}>
              <option value="">🏥 All Specialties</option>
              {ALL_SPECIALTIES.map(s=><option key={s} value={s}>{SPECIALTY_ICONS[s]} {s}</option>)}
            </select>
            <input value={area} onChange={e=>setArea(e.target.value)}
              placeholder="🔎 Area / Locality"
              style={{ flex:'1 1 160px', padding:'12px 14px', borderRadius:10, border:'none', fontSize:14, outline:'none' }} />
            <button className="btn" onClick={handleSearch}
              style={{ background:'#fff', color:'#2563eb', fontWeight:700, padding:'12px 28px', borderRadius:10 }}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:28, paddingBottom:40 }}>

        {/* Specialty chips when not searched */}
        {!searched && (
          <>
            <div className="section-title">Browse by Specialty</div>
            <div className="specialty-grid" style={{ marginBottom:32 }}>
              {ALL_SPECIALTIES.map(sp => (
                <div key={sp} className="specialty-chip" onClick={()=>{setSpecialty(sp);setTimeout(doSearch,50)}}>
                  <div className="specialty-chip-icon">{SPECIALTY_ICONS[sp]}</div>
                  <div className="specialty-chip-label">{sp}</div>
                </div>
              ))}
            </div>
            <div className="section-title">Popular Cities</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {INDIAN_CITIES.slice(0,8).map(c => (
                <button key={c} onClick={()=>{setCity(c);setTimeout(doSearch,50)}}
                  style={{ padding:'8px 18px', borderRadius:20, border:'1.5px solid #e2e8f0',
                    background:'#fff', cursor:'pointer', fontFamily:'Inter,sans-serif',
                    fontSize:14, fontWeight:600, color:'#334155' }}>
                  📍 {c}
                </button>
              ))}
            </div>
          </>
        )}

        {searched && (
          <div style={{ display:'flex', gap:24 }}>
            {/* Filters sidebar */}
            <div style={{ width:220, flexShrink:0 }}>
              <div className="card" style={{ padding:20 }}>
                <div style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>Filters</div>

                <div className="form-group" style={{ marginBottom:14 }}>
                  <label className="form-label">Sort By</label>
                  <select className="form-input" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                    <option value="rating">⭐ Best Rated</option>
                    <option value="exp">🏅 Most Experienced</option>
                    <option value="fee_lo">💰 Fee: Low to High</option>
                    <option value="fee_hi">💰 Fee: High to Low</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom:14 }}>
                  <label className="form-label">Max Fee (₹)</label>
                  <input className="form-input" type="number" min="0" value={maxFee}
                    onChange={e=>setMaxFee(e.target.value)} placeholder="e.g. 1000" />
                </div>

                <div className="form-group" style={{ marginBottom:14 }}>
                  <label className="form-label">Min Experience (yrs)</label>
                  <input className="form-input" type="number" min="0" value={minExp}
                    onChange={e=>setMinExp(e.target.value)} placeholder="e.g. 5" />
                </div>

                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:600 }}>
                  <input type="checkbox" checked={onlineOnly} onChange={e=>setOnlineOnly(e.target.checked)} />
                  Online Consultation
                </label>

                <button className="btn btn-outline btn-sm btn-full" style={{ marginTop:16 }}
                  onClick={() => { setMaxFee(''); setMinExp(''); setOnlineOnly(false); setSortBy('rating') }}>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Results */}
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <span style={{ fontWeight:800, fontSize:18 }}>
                    {loading ? 'Searching…' : `${filtered.length} Doctor${filtered.length!==1?'s':''} Found`}
                  </span>
                  {city && <span style={{ color:'#64748b', fontSize:14, marginLeft:6 }}>in {city}</span>}
                  {specialty && <span style={{ color:'#2563eb', fontSize:14, marginLeft:6 }}>· {specialty}</span>}
                </div>
              </div>

              {loading ? <div className="spinner-wrap"><div className="spinner"/></div>
              : filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">No Doctors Found</div>
                  <div>Try different city, specialty, or adjust filters</div>
                  <button className="btn btn-secondary" style={{ marginTop:16 }}
                    onClick={()=>{setMaxFee('');setMinExp('');setOnlineOnly(false)}}>
                    Clear Filters
                  </button>
                </div>
              ) : filtered.map(doc => <DoctorCard key={doc.id} doc={doc} onClick={()=>navigate(`/doctors/${doc.id}`)}/>)
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DoctorCard({ doc, onClick }) {
  const icon = SPECIALTY_ICONS[doc.specialty] || '🩺'
  return (
    <div className="doctor-card" onClick={onClick}>
      <div style={{ display:'flex', gap:16 }}>
        <div className="doctor-avatar">{icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div className="doctor-name">Dr. {doc.fullName || doc.username}</div>
              <div className="doctor-specialty">{doc.specialty || 'General Physician'}</div>
              {doc.qualifications && <div className="doctor-quals">{doc.qualifications}</div>}
            </div>
            <div style={{ textAlign:'right' }}>
              {doc.consultationFee != null && <div className="fee-tag">₹{doc.consultationFee}</div>}
              {doc.consultationFee != null && <div style={{ fontSize:11, color:'#94a3b8' }}>Consultation Fee</div>}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:6, margin:'8px 0' }}>
            <Stars rating={doc.rating} />
            <span style={{ fontWeight:700, fontSize:14 }}>{(doc.rating||0).toFixed(1)}</span>
            <span style={{ color:'#94a3b8', fontSize:13 }}>({doc.ratingCount||0} reviews)</span>
            {doc.available && <span className="badge badge-green" style={{ marginLeft:4 }}>✓ Available</span>}
            {doc.onlineConsultation && <span className="badge badge-blue">📹 Online</span>}
          </div>

          <div className="doctor-meta">
            {doc.city && <span className="doctor-meta-item">📍 {doc.area ? `${doc.area}, ` : ''}{doc.city}</span>}
            {doc.clinicName && <span className="doctor-meta-item">🏥 {doc.clinicName}</span>}
            {doc.experienceYears != null && <span className="doctor-meta-item">🏅 {doc.experienceYears} yrs experience</span>}
            {doc.languages && <span className="doctor-meta-item">🗣 {doc.languages}</span>}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:14 }}>
        <button className="btn btn-outline btn-sm" style={{ flex:1 }}
          onClick={e=>{e.stopPropagation();window.location.href=`/doctors/${doc.id}`}}>
          View Profile
        </button>
        <button className="btn btn-primary btn-sm" style={{ flex:1 }}
          onClick={e=>{e.stopPropagation();window.location.href=`/book/${doc.id}`}}>
          Book Appointment
        </button>
      </div>
    </div>
  )
}
