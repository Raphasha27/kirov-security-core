'use client'
import { useState, useEffect } from 'react'

interface DashboardSummary {
  total_scans: number
  active_alerts: number
  risk_score: number
  uptime: number
}

interface TrendPoint {
  date: string
  threats: number
  scans: number
}

interface SeverityCount {
  name: string
  value: number
  color: string
}

interface RecentItem {
  id: number
  type: string
  message: string
  severity: string
  timestamp: string
}

export function useDashboard(token: string | null) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [severity, setSeverity] = useState<SeverityCount[]>([])
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      fetch('/api/v1/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/dashboard/trends', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/alerts/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/dashboard/recent', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([s, t, stats, r]) => {
        setSummary(s)
        setTrends(t.trends || t || [])
        setSeverity([
          { name: 'Critical', value: stats.critical || 0, color: '#ff3355' },
          { name: 'High', value: stats.high || 0, color: '#ff8800' },
          { name: 'Medium', value: stats.medium || 0, color: '#ffaa00' },
          { name: 'Low', value: stats.low || 0, color: '#00cc66' },
          { name: 'Info', value: stats.info || 0, color: '#33aaff' },
        ])
        setRecent(r.recent || r || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return { summary, trends, severity, recent, loading }
}
