import type { ToastState } from '../features/products/types'

type ToastProps = {
  toast: ToastState
}

export default function Toast({ toast }: ToastProps) {
  return (
    <div
      id="toast"
      className={`${toast ? 'show' : ''} ${toast?.type ?? ''}`.trim()}
    >
      <div className="toast-icon">{toast?.type === 'error' ? 'x' : 'ok'}</div>
      <span>{toast?.message ?? ''}</span>
    </div>
  )
}
