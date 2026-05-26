import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Stars, SPECIALTY_ICONS, INDIAN_CITIES } from '../components/helpers'
import api from '../services/api'

const EXAMPLES = [
  'Chest pain on left side with shortness of breath when climbing stairs',
  'Severe migraine headache and dizziness since 2 days',
  'Blurred vision in right eye and eye pain',
  'Stomach pain after meals, nausea, and acid reflux',
  'Knee swelling and joint pain, difficulty walking',
  'Skin rash with itching all over body since a week',
  'Irregular periods and lower abdominal pain',
  'My 3-year-old has fever, ear pain and runny nose',
]

export default function AiSymptomChecker() {
  const navigate    = useNavigate()
  const [symptoms,  setSymptoms]  = useState('')
  const [city,      setCity]      = useState('')
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error,     setError]     = useState('')
  const [aiInsight, setAiInsight] = useState('')

  // Step 1: Backend keyword-based analysis + doctor search
  const analyze = async () => {
    if (!symptoms.trim()) { setError('Please describe your symptoms.'); return }
    setLoading(true); setError(''); setResult(null); setAiInsight('')
    try {
      const res = await api.post('/api/ai/analyze', { symptoms, city })
      setResult(res.data)
      // Step 2: Enrich with Claude AI for personalized insight
      getAiInsight(symptoms, res.data.suggestedSpecialty)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Call Claude API directly for rich, personalized health insight
  const getAiInsight = async (symptomsText, specialty) => {
    setAiLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a compassionate medical information assistant (not a licensed doctor). A patient says: "${symptomsText}". Our system recommends they see a ${specialty}.

Write 3 short paragraphs:
1. Plain-English explanation of what these symptoms may indicate and why they shouldn't be ignored
2. Why a ${specialty} is the right specialist to see, and what to expect at the appointment
3. Any RED FLAG warning signs that need immediate emergency care (ER/112 call)

Keep it warm, clear, and simple. Do NOT give a diagnosis. End with: "Please consult a qualified doctor for proper medical evaluation."`
          }]
        })
      })
      const data = await response.json()
      if (data.content?.[0]?.text) setAiInsight(data.content[0].text)
    } catch {
      // AI insight is a bonus feature — silently ignore failures
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="content-wrap" style={{ maxWidth:700 }}>

        {/* Header */}
        <div style={{ textAlign:'center', padding:'36px 0 28px' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>🤖</div>
          <div style={{ fontSize:32, fontWeight:800, marginBottom:8, letterSpacing:'-0.5px' }}>
            AI Symptom Checker
          </div>
          <div style={{ color:'#64748b', fontSize:16, lineHeight:1.7, maxWidth:520, margin:'0 auto' }}>
            Describe your symptoms in plain language. AI instantly identifies the right specialist and finds available doctors near you.
          </div>
        </div>

        {/* Input card */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="form-group" style={{ marginBottom:16 }}>
            <label className="form-label" style={{ fontSize:15 }}>Describe your symptoms *</label>
            <textarea className="form-input" rows={5} value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="e.g. I've had chest pain on the left side for 2 days, along with shortness of breath when climbing stairs. I also feel palpitations occasionally…" />
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:5 }}>
              More detail = more accurate specialist recommendation
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <label className="form-label">
              Your City &nbsp;
              <span style={{ color:'#94a3b8', fontWeight:400 }}>(to show nearby doctors)</span>
            </label>
            <select className="form-input" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">Select city (optional)</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠️ {error}</div>}

          <button className="btn btn-primary btn-full btn-lg" onClick={analyze} disabled={loading}>
            {loading ? '🤖 Analyzing symptoms…' : '🔍 Analyze My Symptoms'}
          </button>
        </div>

        {/* Example chips */}
        {!result && !loading && (
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#64748b', marginBottom:10 }}>
              Or try an example:
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {EXAMPLES.map(s => (
                <button key={s} onClick={() => setSymptoms(s)}
                  style={{
                    padding:'7px 14px', borderRadius:20, border:'1.5px solid #e2e8f0',
                    background:'#fff', cursor:'pointer', fontFamily:'inherit',
                    fontSize:13, color:'#334155',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:'center', padding:48 }}>
            <div className="spinner" style={{ margin:'0 auto 16px' }} />
            <div style={{ color:'#64748b', fontSize:15 }}>Analyzing your symptoms with AI…</div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────── */}
        {result && (
          <div>
            {/* Main AI card */}
            <div className="ai-box" style={{ marginBottom:20 }}>
              <div className="ai-box-header">
                <span style={{ fontSize:24 }}>🤖</span>
                <span className="ai-box-title">AI Analysis Result</span>
                <span className="ai-badge">Instant</span>
              </div>

              {/* Suggested specialty */}
              <div style={{ background:'rgba(255,255,255,.65)', borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>
                  Recommended Specialist
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:38 }}>{SPECIALTY_ICONS[result.suggestedSpecialty] || '🩺'}</span>
                  <div>
                    <div style={{ fontSize:24, fontWeight:800 }}>{result.suggestedSpecialty}</div>
                    <div style={{ fontSize:13, color:'#64748b' }}>Best match for your symptoms</div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize:14, color:'#334155', lineHeight:1.8, marginBottom:14 }}>
                {result.reasoning}
              </div>

              {/* Confidence bar */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                  <span style={{ color:'#64748b', fontWeight:600 }}>AI Confidence</span>
                  <span style={{ fontWeight:800, color:'#2563eb' }}>{Math.round((result.confidence||0)*100)}%</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width:`${(result.confidence||0)*100}%` }} />
                </div>
              </div>

              {/* Alternatives */}
              {result.alternativeSpecialties?.length > 0 && (
                <div>
                  <div style={{ fontSize:13, color:'#64748b', marginBottom:8 }}>Also consider seeing:</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {result.alternativeSpecialties.map(s => (
                      <button key={s}
                        onClick={() => navigate(`/find-doctors?specialty=${encodeURIComponent(s)}${city?`&city=${city}`:''}`)}
                        className="badge badge-gray"
                        style={{ cursor:'pointer', border:'none', background:'rgba(255,255,255,.6)' }}>
                        {SPECIALTY_ICONS[s]||'🩺'} {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Claude AI Insight panel */}
            {(aiLoading || aiInsight) && (
              <div className="card" style={{ marginBottom:20, border:'2px solid #dbeafe' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:20 }}>✨</span>
                  <span style={{ fontWeight:700, fontSize:15 }}>Personalized Health Insight</span>
                  <span className="badge badge-blue" style={{ fontSize:10 }}>Claude AI</span>
                </div>
                {aiLoading ? (
                  <div style={{ display:'flex', alignItems:'center', gap:10, color:'#64748b', fontSize:14 }}>
                    <div className="spinner" style={{ width:20, height:20, borderWidth:2 }} />
                    Generating personalized insight from Claude AI…
                  </div>
                ) : (
                  <div style={{ fontSize:14, color:'#334155', lineHeight:1.8, whiteSpace:'pre-wrap' }}>
                    {aiInsight}
                  </div>
                )}
              </div>
            )}

            {/* Recommended Doctors */}
            {result.recommendedDoctors?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:800, fontSize:20, marginBottom:14 }}>
                  {result.suggestedSpecialty}s {city ? `in ${city}` : 'Available Near You'}
                </div>
                {result.recommendedDoctors.map(doc => (
                  <div key={doc.id} className="doctor-card"
                    onClick={() => navigate(`/doctors/${doc.id}`)}>
                    <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                      <div style={{ width:60, height:60, borderRadius:'50%', background:'#eff6ff',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                        {SPECIALTY_ICONS[doc.specialty]||'🩺'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:16 }}>Dr. {doc.fullName||doc.username}</div>
                        <div style={{ color:'#2563eb', fontWeight:600, fontSize:13 }}>{doc.specialty}</div>
                        {doc.qualifications && <div style={{ fontSize:12, color:'#64748b', marginTop:1 }}>{doc.qualifications}</div>}
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5, flexWrap:'wrap' }}>
                          <Stars rating={doc.rating} size={13}/>
                          <span style={{ fontWeight:700, fontSize:13 }}>{(doc.rating||0).toFixed(1)}</span>
                          {doc.city && <span style={{ fontSize:12, color:'#64748b' }}>📍 {doc.area?`${doc.area}, `:''}{ doc.city}</span>}
                          {doc.experienceYears!=null && <span style={{ fontSize:12, color:'#64748b' }}>🏅 {doc.experienceYears} yrs</span>}
                          {doc.consultationFee!=null && <span style={{ fontWeight:700, fontSize:13 }}>₹{doc.consultationFee}</span>}
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/book/${doc.id}`) }}>
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.recommendedDoctors?.length === 0 && (
              <div className="card" style={{ textAlign:'center', padding:28, marginBottom:20 }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                <div style={{ fontWeight:700, marginBottom:6 }}>
                  No {result.suggestedSpecialty}s found {city ? `in ${city}` : ''}
                </div>
                <div style={{ color:'#64748b', fontSize:14, marginBottom:16 }}>
                  Register as a doctor or try searching without city filter.
                </div>
                <button className="btn btn-primary"
                  onClick={() => navigate(`/find-doctors?specialty=${encodeURIComponent(result.suggestedSpecialty)}`)}>
                  Browse All {result.suggestedSpecialty}s
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:24 }}>
              <button className="btn btn-primary" style={{ flex:1 }}
                onClick={() => navigate(`/find-doctors?specialty=${encodeURIComponent(result.suggestedSpecialty)}${city?`&city=${city}`:''}`)}>
                See All {result.suggestedSpecialty}s →
              </button>
              <button className="btn btn-outline" style={{ flex:1 }}
                onClick={() => { setResult(null); setSymptoms(''); setAiInsight('') }}>
                Check Again
              </button>
            </div>

            {/* Disclaimer */}
            <div style={{ padding:16, background:'#fef9c3', borderRadius:12, fontSize:13, color:'#92400e', lineHeight:1.7, border:'1px solid #fde68a' }}>
              ⚠️ <strong>Medical Disclaimer:</strong> This AI tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare professional.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
