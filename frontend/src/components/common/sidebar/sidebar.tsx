'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/constants';
import { cn } from '@/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar navigation for the dashboard shell.
 *
 * Always visible as a static column on md+ screens; below that it renders as
 * an overlay drawer controlled by `isOpen`/`onClose` (there is no persistent
 * mobile nav otherwise).
 */
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navLinks = (
    <nav className="flex flex-col gap-1 p-4">
      {NAVIGATION_ITEMS.map((item) => {
        const Icon = Icons[item.icon as keyof typeof Icons] as Icons.LucideIcon | undefined;
        const isActive = pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block print:hidden">{navLinks}</aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card shadow-lg">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navLinks}
          </aside>
        </div>
      )}
    </>
  );
}
