import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const stored = localStorage.getItem('userInfo')
    if (token && stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    const { accessToken, user: userInfo } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    setUser(userInfo)
    return userInfo
  }

  const register = async (formData) => {
    await api.post('/api/auth/register', formData)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
