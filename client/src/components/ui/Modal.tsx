'use client'
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx(
        'relative bg-kirov-800 border border-kirov-600/50 rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto',
        className
      )}>
        <div className="flex items-center justify-between p-4 border-b border-kirov-700/50">
          {title && <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h2>}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors ml-auto">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
