'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'white',
          color: '#262626',
          border: '1px solid #e5e5e5',
        },
        className: 'sonner-toast',
      }}
    />
  )
}

