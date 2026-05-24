import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const ALL_SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Ophthalmologist',
  'Gastroenterologist',
  'Dermatologist',
  'Orthopedist',
  'ENT Specialist',
]

const SPECIALTY_ICONS = {
  'General Physician':   '🩺',
  'Cardiologist':        '❤️',
  'Neurologist':         '🧠',
  'Ophthalmologist':     '👁️',
  'Gastroenterologist':  '🫁',
  'Dermatologist':       '🧴',
  'Orthopedist':         '🦴',
  'ENT Specialist':      '👂',
}

export default function NewCase() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', symptoms: '', description: '' })
  const [aiResult, setAiResult] = useState(null)       // { specialty, confidence }
  const [selectedSpecialty, setSelectedSpecialty] = useState('AI') // 'AI' = use AI
  const [previewLoading, setPreviewLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1 = fill form, 2 = confirm specialty

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Preview AI prediction when symptoms are typed (debounced)
  useEffect(() => {
    if (!form.symptoms.trim() || form.symptoms.trim().length < 4) {
      setAiResult(null)
      return
    }
    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        // Use the create endpoint in preview mode — just call ML locally via a
        // lightweight approach: POST a temp case and read back the ML result.
        // We use a dedicated preview by calling the backend with a mock request.
        const res = await api.post('/api/medical/cases/preview', {
          symptoms: form.symptoms,
        })
        setAiResult(res.data)
      } catch {
        // If preview endpoint doesn't exist, silently ignore
      } finally {
        setPreviewLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [form.symptoms])

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.title || !form.symptoms || !form.description) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      setError('')
      await api.post('/api/medical/cases', {
        ...form,
        selectedSpecialty: selectedSpecialty === 'AI' ? null : selectedSpecialty,
      })
      navigate('/dashboard')
    } catch {
      setError('Failed to submit case. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  // ── Step 1: Fill the form ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="page-container">
        <div className="content" style={{ maxWidth: 600 }}>
          <button className="back-link" onClick={() => navigate('/dashboard')}>← Back</button>

          <div className="page-title" style={{ marginBottom: 8 }}>New Case Request</div>
          <div className="subtitle" style={{ marginBottom: 28 }}>
            Describe your symptoms. Our AI will suggest the right specialist — and you can always change it.
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleNext}>
            <div className="input-group">
              <div className="input-field-wrapper">
                <label className="input-label">Case Title</label>
                <input className="input" name="title" value={form.title}
                  onChange={handleChange} placeholder="E.g., Blurred vision since last week" />
              </div>

              <div className="input-field-wrapper">
                <label className="input-label">Symptoms (comma separated)</label>
                <input className="input" name="symptoms" value={form.symptoms}
                  onChange={handleChange}
                  placeholder="blurred vision, eye pain, headache" />

                {/* Live AI preview */}
                {form.symptoms.trim().length > 3 && (
                  <div style={{
                    marginTop: 8, padding: '10px 14px',
                    background: 'var(--primary-light)', borderRadius: 10,
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {previewLoading ? (
                      <span style={{ color: 'var(--text-gray)' }}>🤖 Analysing symptoms…</span>
                    ) : aiResult ? (
                      <>
                        <span>🤖</span>
                        <span style={{ color: 'var(--text-mid)' }}>
                          AI suggests: <strong>{aiResult.specialty}</strong>
                          {aiResult.confidence && (
                            <span style={{ color: 'var(--text-gray)', marginLeft: 6 }}>
                              ({(aiResult.confidence * 100).toFixed(0)}% match)
                            </span>
                          )}
                        </span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="input-field-wrapper">
                <label className="input-label">Detailed Description</label>
                <textarea className="input" name="description" value={form.description}
                  onChange={handleChange} rows={5}
                  placeholder="How long have you had these symptoms? How severe are they?" />
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              Next — Choose Specialist →
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Step 2: Confirm / override specialty ───────────────────────────────────
  return (
    <div className="page-container">
      <div className="content" style={{ maxWidth: 600 }}>
        <button className="back-link" onClick={() => setStep(1)}>← Edit symptoms</button>

        <div className="page-title" style={{ marginBottom: 6 }}>Choose Your Specialist</div>
        <div className="subtitle" style={{ marginBottom: 28 }}>
          Our AI has made a suggestion based on your symptoms. You can keep it or pick a different specialist.
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Case summary */}
        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-gray)', marginBottom: 4 }}>Your case</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{form.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-gray)', marginTop: 4 }}>{form.symptoms}</div>
        </div>

        {/* Let AI decide option */}
        <SpecialtyOption
          icon="🤖"
          label="Let AI Decide (Recommended)"
          sublabel={aiResult
            ? `AI suggests: ${aiResult.specialty} · ${aiResult.confidence ? (aiResult.confidence*100).toFixed(0)+'% match' : ''}`
            : 'Based on your symptoms'}
          selected={selectedSpecialty === 'AI'}
          onClick={() => setSelectedSpecialty('AI')}
          highlight
        />

        <div style={{ fontSize: 12, color: 'var(--text-gray)', margin: '16px 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Or choose manually
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {ALL_SPECIALTIES.map((sp) => (
            <SpecialtyOption
              key={sp}
              icon={SPECIALTY_ICONS[sp] || '🩺'}
              label={sp}
              selected={selectedSpecialty === sp}
              onClick={() => setSelectedSpecialty(sp)}
            />
          ))}
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitLoading}>
          {submitLoading ? 'Submitting…' : '✅ Submit Case'}
        </button>
      </div>
    </div>
  )
}

function SpecialtyOption({ icon, label, sublabel, selected, onClick, highlight }) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 16px',
      borderRadius: 14,
      border: selected
        ? '2px solid var(--primary)'
        : '1.5px solid var(--border)',
      background: selected
        ? 'var(--primary-light)'
        : 'var(--white)',
      cursor: 'pointer',
      transition: 'all 0.15s',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: selected ? 'var(--primary)' : 'var(--text-dark)',
        }}>
          {label}
          {highlight && (
            <span style={{
              marginLeft: 8, fontSize: 10, background: 'var(--primary)',
              color: '#fff', padding: '2px 7px', borderRadius: 20, fontWeight: 700,
              verticalAlign: 'middle',
            }}>Recommended</span>
          )}
        </div>
        {sublabel && (
          <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 3 }}>{sublabel}</div>
        )}
        {selected && (
          <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 3, fontWeight: 600 }}>✓ Selected</div>
        )}
      </div>
    </div>
  )
}
