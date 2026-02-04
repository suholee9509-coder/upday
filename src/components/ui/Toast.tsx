import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ToastProps {
  id: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  action?: {
    label: string
    onClick: () => void
  }
  onClose: (id: string) => void
  duration?: number
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styleMap = {
  success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  warning: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
}

const iconColorMap = {
  success: 'text-emerald-500 dark:text-emerald-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-amber-500 dark:text-amber-400',
}

export function Toast({
  id,
  message,
  type = 'info',
  action,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = iconMap[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 200)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 200)
  }

  const handleAction = () => {
    action?.onClick()
    handleClose()
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'transition-all duration-200 ease-out',
        styleMap[type],
        isExiting
          ? 'opacity-0 translate-x-4'
          : 'opacity-100 translate-x-0 animate-in slide-in-from-right-4 fade-in-0'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', iconColorMap[type])} />

      <span className="flex-1 text-sm font-medium">{message}</span>

      {action && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAction}
          className="h-7 px-2 text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10"
        >
          {action.label}
        </Button>
      )}

      <button
        onClick={handleClose}
        className={cn(
          'p-1 rounded-md transition-colors',
          'hover:bg-black/10 dark:hover:bg-white/10'
        )}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
