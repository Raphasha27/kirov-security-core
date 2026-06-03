'use client'
import { useState, useEffect, useCallback } from 'react'

interface User {
  id: number
  username: string
  email: string
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('kirov_token')
    if (stored) {
      setToken(stored)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    localStorage.setItem('kirov_token', data.access_token)
    setToken(data.access_token)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kirov_token')
    setToken(null)
    setUser(null)
  }, [])

  return { token, user, loading, login, logout, isAuthenticated: !!token }
}
