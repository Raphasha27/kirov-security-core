'use client'
import clsx from 'clsx'

interface BadgeProps {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' | 'default'
  children: React.ReactNode
  className?: string
}

const variants = {
  critical: 'bg-red-900/40 text-red-400 border-red-700/50',
  high: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
  medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
  low: 'bg-green-900/40 text-green-400 border-green-700/50',
  info: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  success: 'bg-kirov-accent/10 text-kirov-accent border-kirov-accent/30',
  warning: 'bg-kirov-warning/10 text-kirov-warning border-kirov-warning/30',
  default: 'bg-kirov-700/50 text-gray-400 border-kirov-600/50',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
