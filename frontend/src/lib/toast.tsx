import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem { id: number; kind: ToastKind; message: string }

interface ToastContextValue {
  push: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const KIND_META: Record<ToastKind, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: '#38a169' },
  error:   { icon: XCircle,      color: '#e53e3e' },
  info:    { icon: Info,         color: '#3182ce' },
}

let uid = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const push = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++uid
    setToasts(t => [...t, { id, kind, message }])
    window.setTimeout(() => remove(id), 3800)
  }, [remove])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map(t => {
          const { icon: Icon, color } = KIND_META[t.kind]
          return (
            <div key={t.id}
              className="animate-slide-up flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm"
              style={{ background: 'rgba(12,17,33,0.95)', borderColor: '#1c2540' }}>
              <Icon size={18} style={{ color, flexShrink: 0, marginTop: 1 }} />
              <span className="text-sm flex-1" style={{ color: '#e2e8f0' }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ color: '#4a5568' }} className="shrink-0 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
