'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/header/header';
import { Sidebar } from '@/components/common/sidebar/sidebar';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex flex-1">
          <div className="hidden w-56 shrink-0 border-r border-border p-4 md:block">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <main className="flex-1 overflow-auto bg-background">
            <div className="container flex flex-col gap-4 p-4 sm:p-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="container p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
