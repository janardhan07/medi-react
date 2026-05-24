import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewCase from './pages/NewCase'
import Chat from './pages/Chat'
import Payment from './pages/Payment'
import FindDoctors from './pages/FindDoctors'
import DoctorProfile from './pages/DoctorProfile'
import DoctorProfileEdit from './pages/DoctorProfileEdit'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-center"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-center"><div className="spinner" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Doctor discovery — public so anyone can browse */}
          <Route path="/find-doctors"  element={<FindDoctors />} />
          <Route path="/doctors/:id"   element={<DoctorProfile />} />

          {/* Protected */}
          <Route path="/dashboard"        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new-case"         element={<ProtectedRoute><NewCase /></ProtectedRoute>} />
          <Route path="/chat/:caseId"     element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/payment/:caseId"  element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/doctor/profile"   element={<ProtectedRoute><DoctorProfileEdit /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
