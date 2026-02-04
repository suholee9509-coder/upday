import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

export interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast, removeToast, clearToasts, toasts } = context

  const toast = {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) =>
      addToast({ message, type: 'success', ...options }),
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) =>
      addToast({ message, type: 'error', ...options }),
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) =>
      addToast({ message, type: 'info', ...options }),
    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) =>
      addToast({ message, type: 'warning', ...options }),
  }

  return { toast, toasts, removeToast, clearToasts }
}
