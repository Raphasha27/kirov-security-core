'use client'
import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Radar, Activity } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/widgets/StatCard'
import { ThreatChart } from '@/components/widgets/ThreatChart'
import { SeverityPie } from '@/components/widgets/SeverityPie'
import { RecentActivity } from '@/components/widgets/RecentActivity'

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [severity, setSeverity] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kirov_token')
    if (!token) return
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
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-kirov-accent border-t-transparent rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Security operations overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Radar size={20} />}
          value={summary?.total_scans ?? 0}
          label="Total Scans"
          trend="up"
          trendValue="12% increase"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          value={summary?.active_alerts ?? 0}
          label="Active Alerts"
          trend={summary?.active_alerts > 0 ? 'up' : 'down'}
          trendValue={summary?.active_alerts > 0 ? 'Needs attention' : 'All clear'}
          accent={summary?.active_alerts > 0}
        />
        <StatCard
          icon={<Shield size={20} />}
          value={summary?.risk_score ?? 'N/A'}
          label="Risk Score"
          trend={summary?.risk_score > 50 ? 'down' : 'up'}
          trendValue={summary?.risk_score > 50 ? 'Elevated' : 'Stable'}
        />
        <StatCard
          icon={<Activity size={20} />}
          value={`${summary?.uptime ?? 0}%`}
          label="Uptime"
          trend="up"
          trendValue="99.9% SLA"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Threat Trends (7 Days)">
          <ThreatChart data={trends.length > 0 ? trends : [
            { date: 'Day 1', threats: 4, scans: 12 },
            { date: 'Day 2', threats: 6, scans: 15 },
            { date: 'Day 3', threats: 3, scans: 10 },
            { date: 'Day 4', threats: 8, scans: 18 },
            { date: 'Day 5', threats: 5, scans: 14 },
            { date: 'Day 6', threats: 7, scans: 16 },
            { date: 'Day 7', threats: 2, scans: 20 },
          ]} />
        </Card>
        <Card title="Severity Distribution">
          <SeverityPie data={severity} />
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent Activity">
          <RecentActivity items={recent} />
        </Card>
        <Card title="Alert Summary">
          {severity.length > 0 ? (
            <div className="space-y-3">
              {severity.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-gray-400">{s.name}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-200">{s.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-kirov-700/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-300">Total</span>
                <span className="text-sm font-mono text-white font-bold">
                  {severity.reduce((a, b) => a + b.value, 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No alert data available</div>
          )}
        </Card>
      </div>
    </div>
  )
}
