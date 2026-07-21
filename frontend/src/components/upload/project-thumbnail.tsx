import { cn } from '@/utils';

const ACCENT_BACKGROUNDS = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
  'bg-chart-7',
  'bg-chart-8',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface ProjectThumbnailProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * A deterministic project "thumbnail" - there's no real project image to
 * show, so this derives a stable color + initial from the project name
 * (the same project always gets the same thumbnail).
 */
export function ProjectThumbnail({ name, size = 48, className }: ProjectThumbnailProps) {
  const colorClass = ACCENT_BACKGROUNDS[hashString(name) % ACCENT_BACKGROUNDS.length];
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center rounded-lg font-bold text-white', colorClass, className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
