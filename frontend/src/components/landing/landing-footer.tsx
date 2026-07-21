import Link from 'next/link';
import { Layers } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Technology', href: '#technology' },
  { label: 'Why Modernize', href: '#why-modernize' },
];

export function LandingFooter() {
  return (
    <footer className="bg-background">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-foreground">AI Legacy Modernization Copilot</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground no-underline hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} AI Legacy Modernization Copilot</p>
      </div>
    </footer>
  );
}
