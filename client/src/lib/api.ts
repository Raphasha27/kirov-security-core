const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FetchOptions extends RequestInit {
  token?: string
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOpts } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOpts, headers })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const auth = {
  login: (username: string, password: string) =>
    fetchApi('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { username: string; email: string; password: string }) =>
    fetchApi('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: (token: string) => fetchApi('/api/v1/auth/me', { token }),
}

export const scans = {
  list: (token: string) => fetchApi('/api/v1/scans', { token }),
  get: (id: number, token: string) => fetchApi(`/api/v1/scans/${id}`, { token }),
  create: (target: string, scanType: string, token: string) =>
    fetchApi('/api/v1/scans', { method: 'POST', body: JSON.stringify({ target, scan_type: scanType }), token }),
  delete: (id: number, token: string) =>
    fetchApi(`/api/v1/scans/${id}`, { method: 'DELETE', token }),
}

export const alerts = {
  list: (token: string, params?: string) => fetchApi(`/api/v1/alerts${params || ''}`, { token }),
  acknowledge: (id: number, token: string) =>
    fetchApi(`/api/v1/alerts/${id}/acknowledge`, { method: 'PUT', token }),
  resolve: (id: number, token: string) =>
    fetchApi(`/api/v1/alerts/${id}/resolve`, { method: 'PUT', token }),
  stats: (token: string) => fetchApi('/api/v1/alerts/stats', { token }),
}

export const dashboard = {
  summary: (token: string) => fetchApi('/api/v1/dashboard/summary', { token }),
  recent: (token: string) => fetchApi('/api/v1/dashboard/recent', { token }),
  trends: (token: string) => fetchApi('/api/v1/dashboard/trends', { token }),
}

export const assistant = {
  analyze: (data: { findings: any[] }, token: string) =>
    fetchApi('/api/v1/assistant/analyze', { method: 'POST', body: JSON.stringify(data), token }),
  chat: (message: string, token: string) =>
    fetchApi('/api/v1/assistant/chat', { method: 'POST', body: JSON.stringify({ message }), token }),
}
