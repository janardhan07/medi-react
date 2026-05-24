import React, { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import api from '../services/api'

const CONSULTATION_FEE = 500 // INR

export default function Payment() {
  const { caseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const caseTitle = location.state?.caseTitle || `Case #${caseId}`

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('confirm') // 'confirm' | 'processing' | 'success' | 'error'
  const [orderId, setOrderId] = useState(null)
  const [message, setMessage] = useState('')

  const createOrder = async () => {
    try {
      setLoading(true)
      setStep('processing')
      const res = await api.post('/api/billing/create_order', {
        amount: CONSULTATION_FEE,
        caseId: Number(caseId),
      })
      setOrderId(res.data.orderId)
      // Simulate the Razorpay modal opening — auto-verify after 1 s
      setTimeout(() => simulateVerify(res.data.orderId), 1000)
    } catch {
      setMessage('Could not create payment order. Please try again.')
      setStep('error')
      setLoading(false)
    }
  }

  const simulateVerify = async (oid) => {
    try {
      await api.post('/api/billing/verify_payment', {
        razorpayOrderId: oid,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
        razorpaySignature: 'simulated_signature_for_mvp',
      })
      setStep('success')
    } catch {
      setMessage('Payment verification failed. Please contact support.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="page-container">
        <div className="content" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div className="page-title" style={{ marginBottom: 12 }}>Payment Successful!</div>
          <div className="subtitle" style={{ marginBottom: 32 }}>
            Your consultation has been confirmed. A doctor will be assigned to your case shortly.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="page-container">
        <div className="content" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>💳</div>
          <div className="page-title" style={{ marginBottom: 12 }}>Processing Payment…</div>
          <div className="subtitle" style={{ marginBottom: 32 }}>
            Connecting to Razorpay payment gateway. Please wait.
          </div>
          <div className="spinner-center"><div className="spinner" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="content" style={{ maxWidth: 520 }}>
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>

        <div className="page-title" style={{ marginBottom: 8 }}>Consultation Payment</div>
        <div className="subtitle" style={{ marginBottom: 28 }}>
          Secure your second opinion with a one-time consultation fee
        </div>

        {step === 'error' && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>{message}</div>
        )}

        {/* Case Summary */}
        <div className="payment-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Case
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{caseTitle}</div>
        </div>

        {/* Pricing */}
        <div className="payment-card">
          <div className="price-row">
            <span className="price-label">Consultation Fee</span>
            <span className="price-value">₹{CONSULTATION_FEE}</span>
          </div>
          <div className="divider" />
          <div className="price-row">
            <span className="total-label">Total</span>
            <span className="total-value">₹{CONSULTATION_FEE}</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="trust-row">
          {[['🔒', 'Secure'], ['💳', 'Razorpay'], ['✅', 'Verified']].map(([icon, label]) => (
            <div key={label} className="trust-badge">
              <div className="trust-icon">{icon}</div>
              <div className="trust-text">{label}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={createOrder} disabled={loading}>
          {loading ? 'Processing…' : `Pay ₹${CONSULTATION_FEE} Securely`}
        </button>

        <div className="disclaimer" style={{ marginTop: 16 }}>
          By proceeding, you agree to our Terms of Service. Payments are processed securely via Razorpay.
          <br />
          <em>This is a demo – payment is simulated.</em>
        </div>
      </div>
    </div>
  )
}
