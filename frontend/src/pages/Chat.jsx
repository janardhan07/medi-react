import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Chat() {
  const { caseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const caseTitle = location.state?.caseTitle || `Case #${caseId}`

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/appointments/cases/${caseId}/chat`)
      setMessages(res.data)
    } catch (e) {
      if (e.response?.status === 403) {
        setError('You do not have permission to view this chat.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // Poll every 10 seconds (same as original)
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [caseId])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim()) return
    try {
      await api.post(`/api/appointments/cases/${caseId}/chat`, { message: text })
      setText('')
      await fetchMessages()
    } catch (e) {
      console.error('Failed to send message', e)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button className="back-link" style={{ margin: 0 }} onClick={() => navigate('/dashboard')}>
          ←
        </button>
        <div className="chat-title">{caseTitle}</div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="spinner-center" style={{ flex: 1 }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="empty-state" style={{ flex: 1 }}>
          <div className="empty-icon">🔒</div>
          <div>{error}</div>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div>No messages yet. Start the conversation!</div>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`msg-wrapper ${isMe ? 'mine' : 'theirs'}`}>
                {!isMe && (
                  <div className="msg-sender">{msg.senderUsername}</div>
                )}
                <div className={`bubble ${isMe ? 'mine' : 'theirs'}`}>
                  {msg.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, padding: '0 6px' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      {!error && (
        <div className="chat-input-area">
          <textarea
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!text.trim()}>
            Send
          </button>
        </div>
      )}
    </div>
  )
}
