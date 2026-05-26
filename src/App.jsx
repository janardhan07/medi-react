import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home             from './pages/Home'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import FindDoctors      from './pages/FindDoctors'
import DoctorProfile    from './pages/DoctorProfile'
import BookAppointment  from './pages/BookAppointment'
import Appointments     from './pages/Appointments'
import AppointmentDetail from './pages/AppointmentDetail'
import DoctorProfileEdit from './pages/DoctorProfileEdit'
import AiSymptomChecker from './pages/AiSymptomChecker'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (!user)   return <Navigate to="/login" replace />
  return children
}

function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Public><Login /></Public>} />
          <Route path="/register"      element={<Public><Register /></Public>} />
          <Route path="/find-doctors"  element={<FindDoctors />} />
          <Route path="/doctors/:id"   element={<DoctorProfile />} />
          <Route path="/symptom-check" element={<AiSymptomChecker />} />
          <Route path="/dashboard"          element={<Protected><Dashboard /></Protected>} />
          <Route path="/appointments"       element={<Protected><Appointments /></Protected>} />
          <Route path="/appointments/:id"   element={<Protected><AppointmentDetail /></Protected>} />
          <Route path="/book/:doctorId"     element={<Protected><BookAppointment /></Protected>} />
          <Route path="/doctor/profile"     element={<Protected><DoctorProfileEdit /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
