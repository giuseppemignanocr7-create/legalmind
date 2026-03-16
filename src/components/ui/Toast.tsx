import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#12121A',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#E8E6E1',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          fontSize: '14px',
        },
        className: 'shadow-card',
      }}
      richColors
    />
  )
}
