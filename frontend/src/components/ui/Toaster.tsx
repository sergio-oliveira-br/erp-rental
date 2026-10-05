// frontend/src/components/ui/Toaster.tsx

'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '8px',
          fontSize: '14px',
        },
      }}
    />
  );
}