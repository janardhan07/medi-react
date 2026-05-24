import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function statusClass(status) {
  return {
    PENDING:  'badge badge-pending',
    ASSIGNED: 'badge badge-assigned',
    REVIEWED: 'badge badge-reviewed',
  }[status] || 'badge'
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCases = async () => {
    try {
      const res = await api.get('/api/medical/cases')
      setCases(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="header-greeting">Hello,</div>
          <div className="header-name">{user?.username}</div>
          <div className="header-role">{user?.role}</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="content">
        <div className="section-header">
          <div className="section-title">
            {user?.role === 'PATIENT' ? 'Your Cases' : user?.role === 'DOCTOR' ? 'Assigned Cases' : 'All Cases'}
          </div>
          {user?.role === 'PATIENT' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/new-case')}>
              + New Case
            </button>
          )}
        </div>

        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <div>No cases yet.</div>
            {user?.role === 'PATIENT' && (
              <div style={{ marginTop: 8 }}>Click <strong>+ New Case</strong> to get your second opinion.</div>
            )}
          </div>
        ) : (
          cases.map((c) => (
            <div key={c.id} className="case-card">
              <div className="case-header">
                <div className="case-title">{c.title}</div>
                <span className={statusClass(c.status)}>{c.status}</span>
              </div>

              <div className="case-symptoms">{c.symptoms}</div>

              {c.effectiveSpecialty && (
                <div className="ml-box">
                  <div className="ml-label">{c.selectedSpecialty ? '👤 Your Selected Specialist' : '🤖 AI Suggested Specialty'}</div>
                  <div className="ml-value">
                    {c.effectiveSpecialty}
                    {c.mlConfidenceScore != null && (
                      <span style={{ color: 'var(--text-gray)', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                        ({(c.mlConfidenceScore * 100).toFixed(0)}% match)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 14 }}>
                Patient: {c.patientUsername}
                {c.assignedDoctorUsername && ` · Doctor: ${c.assignedDoctorUsername}`}
              </div>

              <div className="action-row">
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/chat/${c.id}`, { state: { caseTitle: c.title } })}
                >
                  💬 Chat
                </button>
                {user?.role === 'PATIENT' && c.status === 'PENDING' && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/payment/${c.id}`, { state: { caseTitle: c.title } })}
                  >
                    💳 Pay Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
