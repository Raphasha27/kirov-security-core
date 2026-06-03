'use client'
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accent?: boolean
}

export function StatCard({ icon, value, label, trend, trendValue, accent }: StatCardProps) {
  return (
    <div className={clsx(
      'glass-panel p-4 flex items-start gap-3 group hover:border-kirov-500/50 transition-all duration-300',
      accent && 'border-kirov-accent/20'
    )}>
      <div className={clsx(
        'p-2.5 rounded-lg shrink-0',
        accent ? 'bg-kirov-accent/10 text-kirov-accent' : 'bg-kirov-700/50 text-kirov-300'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white font-mono tabular-nums">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{label}</div>
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 mt-1.5 text-xs',
            trend === 'up' && 'text-green-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-gray-400'
          )}>
            {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
