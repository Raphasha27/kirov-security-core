'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Loader2, Play } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

interface Scan {
  id: number
  target: string
  scan_type: string
  status: string
  risk_score: number | null
  created_at: string
  findings?: any[]
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [target, setTarget] = useState('')
  const [scanType, setScanType] = useState('quick')
  const [creating, setCreating] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('kirov_token') : null

  const fetchScans = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/v1/scans', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setScans(data.scans || data || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchScans() }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !target) return
    setCreating(true)
    try {
      await fetch('/api/v1/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target, scan_type: scanType }),
      })
      setTarget('')
      setScanType('quick')
      setShowCreate(false)
      fetchScans()
    } catch {}
    setCreating(false)
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    try {
      await fetch(`/api/v1/scans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchScans()
    } catch {}
  }

  const statusBadge = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
      completed: 'success',
      running: 'info',
      pending: 'warning',
      failed: 'critical',
    }
    return <Badge variant={map[status] || 'default'}>{status}</Badge>
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'target', label: 'Target', sortable: true, render: (s: Scan) => <span className="font-mono text-kirov-info">{s.target}</span> },
    { key: 'scan_type', label: 'Type', sortable: true, render: (s: Scan) => <Badge variant="info">{s.scan_type}</Badge> },
    { key: 'status', label: 'Status', sortable: true, render: (s: Scan) => statusBadge(s.status) },
    { key: 'risk_score', label: 'Risk', sortable: true, render: (s: Scan) => (
      s.risk_score != null ? (
        <span className={`font-mono ${s.risk_score > 70 ? 'text-kirov-danger' : s.risk_score > 40 ? 'text-kirov-warning' : 'text-green-400'}`}>
          {s.risk_score}
        </span>
      ) : <span className="text-gray-600">-</span>
    )},
    { key: 'created_at', label: 'Date', sortable: true, render: (s: Scan) => (
      <span className="text-xs text-gray-500">{s.created_at}</span>
    )},
    { key: 'actions', label: '', render: (s: Scan) => (
      <button
        onClick={(e) => { e.stopPropagation(); handleDelete(s.id) }}
        className="p-1.5 text-gray-500 hover:text-kirov-danger transition-colors"
      >
        <Trash2 size={14} />
      </button>
    )},
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading scans...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Scans</h1>
          <p className="text-xs text-gray-500 mt-1">Manage security scans</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kirov-accent text-kirov-900 text-sm font-semibold hover:bg-kirov-accent/90 transition-colors"
        >
          <Plus size={16} />
          New Scan
        </button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={scans}
          onRowClick={(s) => setSelectedScan(s)}
          emptyMessage="No scans found. Create a new scan to get started."
        />
      </Card>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Scan">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Target</label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 10.0.0.1 or example.com"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Scan Type</label>
            <select
              value={scanType}
              onChange={e => setScanType(e.target.value)}
              className="w-full"
            >
              <option value="quick">Quick</option>
              <option value="full">Full</option>
              <option value="vulnerability">Vulnerability</option>
              <option value="port">Port Scan</option>
              <option value="web">Web Application</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !target}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kirov-accent text-kirov-900 text-sm font-semibold hover:bg-kirov-accent/90 transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {creating ? 'Starting...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!selectedScan} onClose={() => setSelectedScan(null)} title={`Scan #${selectedScan?.id}`}>
        {selectedScan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Target</label>
                <p className="text-sm font-mono text-kirov-info">{selectedScan.target}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Type</label>
                <Badge variant="info">{selectedScan.scan_type}</Badge>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Status</label>
                {statusBadge(selectedScan.status)}
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Risk Score</label>
                <span className={`font-mono text-sm ${selectedScan.risk_score && selectedScan.risk_score > 70 ? 'text-kirov-danger' : 'text-gray-300'}`}>
                  {selectedScan.risk_score ?? 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Created</label>
              <p className="text-sm text-gray-400">{selectedScan.created_at}</p>
            </div>
            {selectedScan.findings && selectedScan.findings.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Findings</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedScan.findings.map((f: any, i: number) => (
                    <div key={i} className="p-2.5 rounded bg-kirov-700/30 border border-kirov-600/30 text-sm text-gray-300">
                      {f.description || JSON.stringify(f)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
