import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/app/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AI Legacy Modernization Copilot',
  description: 'AI-powered platform for analyzing, assessing and modernizing enterprise legacy applications.',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (prefersDark ? 'dark' : 'light');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applied before paint to avoid a flash of the wrong theme; ThemeProvider takes over after hydration. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
