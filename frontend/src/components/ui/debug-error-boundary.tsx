'use client';

import { Component, ReactNode } from 'react';

interface DebugErrorBoundaryProps {
  label: string;
  children: ReactNode;
}

interface DebugErrorBoundaryState {
  error: Error | null;
  componentStack: string | null;
}

/**
 * TEMPORARY diagnostic boundary for the React error #31 investigation
 * (rendering a raw {value, confidenceScore, evidence} object as a JSX child).
 * Next.js's app/error.tsx only receives `error`, not the component stack that
 * names which component actually rendered the bad child - this fills that gap.
 * Remove once the root cause is found and fixed.
 */
export class DebugErrorBoundary extends Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  state: DebugErrorBoundaryState = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ componentStack: errorInfo.componentStack });
    console.error(`[DebugErrorBoundary:${this.props.label}]`, error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm">
          <p className="font-semibold text-destructive">
            Caught in boundary &quot;{this.props.label}&quot;: {this.state.error.message}
          </p>
          <pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap text-xs text-destructive/80">
            {this.state.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
