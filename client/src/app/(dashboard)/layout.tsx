'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield, LayoutDashboard, ScanLine, Bell, Bot, Settings,
  ChevronLeft, ChevronRight, LogOut, User, Menu,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scans', label: 'Scans', icon: ScanLine },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/assistant', label: 'Assistant', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('kirov_token')
    window.location.href = '/login'
  }

  const sidebar = (
    <div className={clsx(
      'h-full flex flex-col bg-kirov-900 border-r border-kirov-700/50 transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className={clsx(
        'flex items-center gap-3 px-4 h-16 border-b border-kirov-700/50 shrink-0',
        collapsed && 'justify-center px-2'
      )}>
        <div className="p-1.5 rounded-lg bg-kirov-accent/10">
          <Shield size={22} className="text-kirov-accent" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-white tracking-wider truncate">KIROV</div>
            <div className="text-[10px] text-gray-500 tracking-widest truncate">SECURITY CORE</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                collapsed && 'justify-center px-2',
                active
                  ? 'bg-kirov-accent/10 text-kirov-accent border border-kirov-accent/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-kirov-800/50 border border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={clsx(
        'border-t border-kirov-700/50 p-2',
        collapsed && 'flex flex-col items-center'
      )}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={clsx(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-kirov-800/50 transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <User size={18} />
            {!collapsed && <span>Operator</span>}
          </button>
          {userMenuOpen && (
            <div className={clsx(
              'absolute bottom-full mb-2 bg-kirov-800 border border-kirov-600/50 rounded-lg shadow-xl py-1 min-w-[140px]',
              collapsed ? 'left-1/2 -translate-x-1/2' : 'left-2 right-2'
            )}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-kirov-700/30 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'mt-2 p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-kirov-800/50 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex overflow-hidden bg-kirov-900">
      {/* Desktop sidebar */}
      <div className="hidden md:block h-full shrink-0">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 h-full">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-kirov-700/50 bg-kirov-900">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-kirov-accent" />
            <span className="text-sm font-bold text-white">KIROV</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <StatusBadge status="online" />
          </div>
        </div>

        {/* Header */}
        <div className="hidden md:flex items-center justify-between px-6 h-14 border-b border-kirov-700/50 bg-kirov-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 terminal-prompt">system ready</span>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="online" label="System Online" />
            <StatusBadge status="active" label="All Services" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
