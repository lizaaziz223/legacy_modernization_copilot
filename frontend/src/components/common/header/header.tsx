'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/common/theme-toggle/theme-toggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * Top navigation bar for the dashboard shell
 */
export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6 print:hidden">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link href="/dashboard" className="text-sm font-semibold no-underline">
          AI Legacy Modernization Copilot
        </Link>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <ThemeToggle />
        {user && (
          <>
            <Link
              href="/profile"
              className="hidden text-muted-foreground no-underline hover:text-foreground sm:inline"
            >
              {user.name}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
