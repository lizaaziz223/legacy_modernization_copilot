import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './reveal';

export function CtaSection() {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="container py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to modernize your legacy applications?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Upload your first project and get an AI-powered modernization roadmap in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-semibold text-foreground no-underline hover:opacity-90"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground no-underline hover:bg-primary-foreground/10"
            >
              Sign In
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
