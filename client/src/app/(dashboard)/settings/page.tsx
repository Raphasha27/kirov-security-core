'use client'
import { useState, useEffect } from 'react'
import { User, Key, Bell, Settings2, Save, Copy, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function SettingsPage() {
  const [username, setUsername] = useState('operator')
  const [email, setEmail] = useState('operator@kirov.local')
  const [apiKey, setApiKey] = useState('ksc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  const [showKey, setShowKey] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    critical: true,
    high: true,
    medium: false,
    low: false,
  })
  const [saving, setSaving] = useState<string | null>(null)

  const [scanInterval, setScanInterval] = useState('3600')
  const [maxRetries, setMaxRetries] = useState('3')
  const [logLevel, setLogLevel] = useState('info')

  const handleSave = async (section: string) => {
    setSaving(section)
    await new Promise(r => setTimeout(r, 800))
    setSaving(null)
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-white">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">System configuration</p>
      </div>

      {/* Profile */}
      <Card title="Profile" action={
        <button
          onClick={() => handleSave('profile')}
          disabled={!!saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-kirov-accent hover:bg-kirov-accent/10 transition-colors border border-kirov-accent/30 disabled:opacity-50"
        >
          {saving === 'profile' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save
        </button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* API Key */}
      <Card title="API Key" action={
        <button
          onClick={() => handleSave('api')}
          disabled={!!saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-kirov-accent hover:bg-kirov-accent/10 transition-colors border border-kirov-accent/30 disabled:opacity-50"
        >
          {saving === 'api' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Regenerate
        </button>
      }>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-kirov-warning" />
            <div className="flex-1 flex items-center gap-2">
              <code className="flex-1 p-2 rounded bg-kirov-900 border border-kirov-700/50 text-sm font-mono text-kirov-warning">
                {showKey ? apiKey : 'ksc_••••••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={copyApiKey}
                className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600">Use this key to authenticate API requests. Keep it secure.</p>
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notification Preferences" action={
        <button
          onClick={() => handleSave('notifications')}
          disabled={!!saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-kirov-accent hover:bg-kirov-accent/10 transition-colors border border-kirov-accent/30 disabled:opacity-50"
        >
          {saving === 'notifications' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save
        </button>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-9 h-5 rounded-full transition-colors ${notifications.email ? 'bg-kirov-accent' : 'bg-kirov-600'} relative`}
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifications.email ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <span className="text-sm text-gray-300">Email Notifications</span>
                <p className="text-xs text-gray-600">Receive alerts via email</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-9 h-5 rounded-full transition-colors ${notifications.push ? 'bg-kirov-accent' : 'bg-kirov-600'} relative`}
                onClick={() => setNotifications({ ...notifications, push: !notifications.push })}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifications.push ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <span className="text-sm text-gray-300">Push Notifications</span>
                <p className="text-xs text-gray-600">In-app notifications</p>
              </div>
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Alert Severity Filters</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(notifications).filter(([k]) => ['critical', 'high', 'medium', 'low'].includes(k)).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => setNotifications({ ...notifications, [key]: !val })}
                    className="w-4 h-4 rounded border-kirov-600 bg-kirov-800 accent-kirov-accent"
                  />
                  <span className="text-xs text-gray-400 capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* System Configuration */}
      <Card title="System Configuration" action={
        <button
          onClick={() => handleSave('system')}
          disabled={!!saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-kirov-accent hover:bg-kirov-accent/10 transition-colors border border-kirov-accent/30 disabled:opacity-50"
        >
          {saving === 'system' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save
        </button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Scan Interval (s)</label>
            <input
              type="number"
              value={scanInterval}
              onChange={e => setScanInterval(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Max Retries</label>
            <input
              type="number"
              value={maxRetries}
              onChange={e => setMaxRetries(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Log Level</label>
            <select value={logLevel} onChange={e => setLogLevel(e.target.value)} className="w-full">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )
}
