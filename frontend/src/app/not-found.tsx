import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-8xl font-bold text-primary/20 dark:text-primary/10 mb-4 font-mono">404</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Page not found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
              Go Home
            </Link>
            <Link href="/search" className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Browse Listings
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
