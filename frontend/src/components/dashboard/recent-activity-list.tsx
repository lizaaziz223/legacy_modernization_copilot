import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/utils';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  href: string;
}

interface RecentActivityListProps {
  icon: LucideIcon;
  items: ActivityItem[];
  emptyMessage: string;
}

/** A compact recent-activity feed, reused for uploads/reports/analyses. */
export function RecentActivityList({ icon: Icon, items, emptyMessage }: RecentActivityListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-center gap-3 rounded-md px-2 py-2 no-underline transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
