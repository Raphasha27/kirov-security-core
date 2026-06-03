'use client'
import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, Shield, AlertTriangle, BookOpen, Sparkles, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import clsx from 'clsx'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

const quickPrompts = [
  { label: 'Analyze scan results', icon: AlertTriangle, prompt: 'Analyze the latest security scan results and identify potential vulnerabilities.' },
  { label: 'Security tips', icon: Shield, prompt: 'Give me best practices for improving our security posture.' },
  { label: 'Vulnerability help', icon: BookOpen, prompt: 'How do I remediate common critical vulnerabilities in web applications?' },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to Kirov Security Assistant. I can help you analyze threats, review scan results, and recommend security measures. How can I assist you today?',
      id: 'welcome',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('kirov_token') : null

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !token) return

    const userMsg: Message = { role: 'user', content: text, id: `user-${Date.now()}` }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const data = await res.json()
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.response || data.message || 'I processed your request.',
          id: `assistant-${Date.now()}`,
        }
        setMessages(prev => [...prev, assistantMsg])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
          id: `error-${Date.now()}`,
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error. Please check your connection.',
        id: `error-${Date.now()}`,
      }])
    }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-lg font-bold text-white">AI Assistant</h1>
        <p className="text-xs text-gray-500 mt-1">Security analysis and recommendations</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col glass-panel min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={clsx(
                  'flex items-start gap-3',
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={clsx(
                  'p-2 rounded-lg shrink-0',
                  msg.role === 'assistant'
                    ? 'bg-kirov-accent/10 text-kirov-accent'
                    : 'bg-kirov-info/10 text-kirov-info'
                )}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={clsx(
                  'max-w-[80%] rounded-lg p-3 text-sm leading-relaxed',
                  msg.role === 'assistant'
                    ? 'bg-kirov-700/30 border border-kirov-600/30 text-gray-200'
                    : 'bg-kirov-accent/10 border border-kirov-accent/20 text-gray-200'
                )}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('- ') ? 'pl-4 text-gray-400' : line.startsWith('#') ? 'text-white font-semibold mt-2' : 'text-gray-300'}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-kirov-accent/10 text-kirov-accent">
                  <Bot size={16} />
                </div>
                <div className="bg-kirov-700/30 border border-kirov-600/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-kirov-700/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-lg bg-kirov-accent text-kirov-900 hover:bg-kirov-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-3">
          <Card title="Quick Actions">
            <div className="space-y-2">
              {quickPrompts.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(item.prompt)}
                  disabled={loading}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-xs text-left text-gray-400 hover:text-gray-200 hover:bg-kirov-700/30 border border-transparent hover:border-kirov-600/50 transition-all disabled:opacity-50"
                >
                  <item.icon size={14} className="text-kirov-info shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Capabilities">
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <Sparkles size={12} className="text-kirov-accent mt-0.5 shrink-0" />
                Threat analysis and reporting
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={12} className="text-kirov-accent mt-0.5 shrink-0" />
                Vulnerability assessment
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={12} className="text-kirov-accent mt-0.5 shrink-0" />
                Security best practices
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={12} className="text-kirov-accent mt-0.5 shrink-0" />
                Incident response guidance
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={12} className="text-kirov-accent mt-0.5 shrink-0" />
                Log analysis assistance
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
