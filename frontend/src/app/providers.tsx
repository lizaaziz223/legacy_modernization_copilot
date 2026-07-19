'use client';

import React, { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster richColors position="top-right" theme={theme} />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedToaster />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
