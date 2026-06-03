'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Filter, RefreshCw, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import clsx from 'clsx'

interface Alert {
  id: number
  title: string
  description: string
  severity: string
  status: string
  source: string
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [stats, setStats] = useState<any>({})
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const token = typeof window !== 'undefined' ? localStorage.getItem('kirov_token') : null

  const fetchAlerts = async () => {
    if (!token) return
    try {
      let url = '/api/v1/alerts'
      const params = new URLSearchParams()
      if (severityFilter) params.set('severity', severityFilter)
      if (statusFilter) params.set('status', statusFilter)
      const qs = params.toString()
      if (qs) url += `?${qs}`

      const [alertsRes, statsRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/alerts/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAlerts(data.alerts || data || [])
      }
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
    } catch {}
    setLoading(false)
    setLastUpdated(new Date())
  }

  useEffect(() => { fetchAlerts() }, [token, severityFilter, statusFilter])

  const handleAcknowledge = async (id: number) => {
    if (!token) return
    await fetch(`/api/v1/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchAlerts()
  }

  const handleResolve = async (id: number) => {
    if (!token) return
    await fetch(`/api/v1/alerts/${id}/resolve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchAlerts()
  }

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'border-l-kirov-danger'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-kirov-warning'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-kirov-info'
    }
  }

  const severityBadgeVariant = (s: string): 'critical' | 'high' | 'medium' | 'low' | 'info' => {
    switch (s) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'info'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading alerts...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Alerts</h1>
          <p className="text-xs text-gray-500 mt-1">Security event monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <RefreshCw size={12} />
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-kirov-800/50 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-3 text-center">
          <div className="text-2xl font-bold text-kirov-danger font-mono">{stats.critical || 0}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Critical</div>
        </div>
        <div className="glass-panel p-3 text-center">
          <div className="text-2xl font-bold text-orange-400 font-mono">{stats.high || 0}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">High</div>
        </div>
        <div className="glass-panel p-3 text-center">
          <div className="text-2xl font-bold text-kirov-warning font-mono">{stats.medium || 0}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Medium</div>
        </div>
        <div className="glass-panel p-3 text-center">
          <div className="text-2xl font-bold text-green-400 font-mono">{stats.low || 0}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Low</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter size={14} />
          Filters:
        </div>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="text-xs py-1.5 px-2 w-auto"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-2 w-auto"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500 text-sm">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-30 text-green-400" />
              No alerts matching your filters
            </div>
          </Card>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={clsx(
                'glass-panel border-l-4 p-4 cursor-pointer hover:bg-kirov-700/20 transition-all',
                severityColor(alert.severity)
              )}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className={clsx(
                      alert.severity === 'critical' ? 'text-kirov-danger' :
                      alert.severity === 'high' ? 'text-orange-400' :
                      alert.severity === 'medium' ? 'text-kirov-warning' :
                      'text-kirov-info'
                    )} />
                    <h4 className="text-sm font-semibold text-white truncate">{alert.title || `Alert #${alert.id}`}</h4>
                    <Badge variant={severityBadgeVariant(alert.severity)}>{alert.severity}</Badge>
                    <Badge variant={alert.status === 'resolved' ? 'success' : alert.status === 'acknowledged' ? 'info' : 'warning'}>
                      {alert.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{alert.description}</p>
                  <span className="text-[10px] text-gray-600 mt-1 block">{alert.created_at}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {alert.status !== 'resolved' && (
                    <>
                      {alert.status === 'active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id) }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-kirov-info hover:bg-kirov-info/10 transition-colors border border-kirov-info/30"
                        >
                          <CheckCircle size={12} />
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResolve(alert.id) }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-green-400 hover:bg-green-900/20 transition-colors border border-green-700/30"
                      >
                        <XCircle size={12} />
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!selectedAlert} onClose={() => setSelectedAlert(null)} title={`Alert #${selectedAlert?.id}`}>
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={severityBadgeVariant(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
              <Badge variant={selectedAlert.status === 'resolved' ? 'success' : selectedAlert.status === 'acknowledged' ? 'info' : 'warning'}>
                {selectedAlert.status}
              </Badge>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Title</label>
              <p className="text-sm text-white">{selectedAlert.title}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Description</label>
              <p className="text-sm text-gray-300">{selectedAlert.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Source</label>
                <p className="text-sm font-mono text-gray-400">{selectedAlert.source || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Created</label>
                <p className="text-sm text-gray-400">{selectedAlert.created_at}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {selectedAlert.status === 'active' && (
                <button
                  onClick={() => { handleAcknowledge(selectedAlert.id); setSelectedAlert(null) }}
                  className="px-4 py-2 rounded-lg text-sm bg-kirov-info/10 text-kirov-info border border-kirov-info/30 hover:bg-kirov-info/20 transition-colors"
                >
                  Acknowledge
                </button>
              )}
              {selectedAlert.status !== 'resolved' && (
                <button
                  onClick={() => { handleResolve(selectedAlert.id); setSelectedAlert(null) }}
                  className="px-4 py-2 rounded-lg text-sm bg-green-900/20 text-green-400 border border-green-700/30 hover:bg-green-900/40 transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
