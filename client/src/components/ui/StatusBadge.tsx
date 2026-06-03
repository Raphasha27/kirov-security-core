'use client'
import clsx from 'clsx'

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'warning' | 'active' | string
  label?: string
  className?: string
}

const dotColors: Record<string, string> = {
  online: 'bg-green-500 shadow-[0_0_6px_rgba(0,255,136,0.5)]',
  active: 'bg-green-500 shadow-[0_0_6px_rgba(0,255,136,0.5)]',
  offline: 'bg-gray-500',
  busy: 'bg-yellow-500 shadow-[0_0_6px_rgba(255,170,0,0.5)]',
  warning: 'bg-orange-500 shadow-[0_0_6px_rgba(255,136,0,0.5)]',
  critical: 'bg-red-500 shadow-[0_0_6px_rgba(255,51,85,0.5)]',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const dotClass = dotColors[status] || 'bg-gray-500'
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs text-gray-400', className)}>
      <span className={clsx('w-2 h-2 rounded-full', dotClass)} />
      {label || status}
    </span>
  )
}
