import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Search Listings | Ashimarket',
  description: 'Search millions of listings across all categories on Ashimarket — Nigeria\'s largest online marketplace.',
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
