import { useToast } from '@/hooks/useToast'
import { Toast } from './Toast'

export function Toaster() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            action={toast.action}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  )
}
