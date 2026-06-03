'use client'
import { Clock, Shield, AlertTriangle, ScanLine, Bot } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import clsx from 'clsx'

interface ActivityItem {
  id: number
  type: string
  message: string
  severity: string
  timestamp: string
}

interface RecentActivityProps {
  items: ActivityItem[]
}

const typeIcons: Record<string, React.ReactNode> = {
  alert: <AlertTriangle size={14} />,
  scan: <ScanLine size={14} />,
  assistant: <Bot size={14} />,
  system: <Shield size={14} />,
}

const severityVariant: Record<string, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
  info: 'info',
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <Shield size={32} className="mx-auto mb-2 opacity-30" />
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-kirov-700/20 transition-colors"
        >
          <div className={clsx(
            'p-1.5 rounded shrink-0 mt-0.5',
            item.severity === 'critical' ? 'text-kirov-danger bg-kirov-danger/10' :
            item.severity === 'high' ? 'text-orange-400 bg-orange-900/20' :
            item.severity === 'medium' ? 'text-kirov-warning bg-kirov-warning/10' :
            item.severity === 'low' ? 'text-green-400 bg-green-900/20' :
            'text-kirov-info bg-kirov-info/10'
          )}>
            {typeIcons[item.type] || <Shield size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 truncate">{item.message}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={severityVariant[item.severity] || 'default'}>{item.severity}</Badge>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Clock size={10} />
                {item.timestamp}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
