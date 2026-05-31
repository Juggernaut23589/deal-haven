import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = { title: 'How It Works' };

const STEPS = [
  {
    step: '01',
    title: 'Create an Account',
    desc: 'Sign up as a buyer, seller, or both. It takes under a minute.',
  },
  {
    step: '02',
    title: 'Browse or Post Listings',
    desc: 'Search thousands of listings across all categories, or post your item in under 2 minutes with photos, a description, and your price.',
  },
  {
    step: '03',
    title: 'Connect & Negotiate',
    desc: 'Message sellers directly, make an offer, or request to buy at the listed price. All communication happens in-app.',
  },
  {
    step: '04',
    title: 'Agree on Payment',
    desc: 'Buyers and sellers agree on how to complete payment privately — bank transfer, cash on delivery, or any method that suits both parties.',
  },
  {
    step: '05',
    title: 'Confirm & Review',
    desc: 'Once you receive your item, confirm delivery in the app. Leave a review to help future buyers and sellers.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-4">How Ashimarket Works</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-12">
          Ashimarket connects buyers and sellers across Nigeria. Here&apos;s how to get started.
        </p>

        <div className="space-y-8">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">
                {step}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/search" className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
            Start Browsing
          </Link>
          <Link href="/listing/create" className="inline-flex items-center rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
            Post a Listing
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
