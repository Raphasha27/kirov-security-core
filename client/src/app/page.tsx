'use client'
import { useEffect } from 'react'

export default function RootPage() {
  useEffect(() => {
    const token = localStorage.getItem('kirov_token')
    if (token) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/login'
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-kirov-900">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-kirov-accent border-t-transparent rounded-full animate-spin" />
        Redirecting...
      </div>
    </div>
  )
}
