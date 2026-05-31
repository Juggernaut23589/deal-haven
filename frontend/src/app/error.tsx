'use client';

import * as React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isStaleDeployment =
    error.message?.includes('Server Action') ||
    error.message?.includes('workers') ||
    error.message?.includes('older or newer deployment');

  React.useEffect(() => {
    // Auto-reload on stale deployment errors
    if (isStaleDeployment) {
      window.location.reload();
    }
  }, [isStaleDeployment]);

  if (isStaleDeployment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-background-dark px-4">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading latest version…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-background-dark px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
          <AlertTriangle className="h-7 w-7 text-error" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          An unexpected error occurred. Please try again or refresh the page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Go Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-slate-400 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs text-error bg-error/5 rounded-lg p-3 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
