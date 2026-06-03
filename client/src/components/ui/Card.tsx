'use client'
import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <div className={clsx('glass-panel p-4', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3 pb-2 scan-line">
          {title && <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
