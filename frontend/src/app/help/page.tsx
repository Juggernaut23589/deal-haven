import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = { title: 'Help Center' };

const FAQS = [
  { q: 'How do I post a listing?', a: 'Log in, click "Post a Listing" in the top menu or from your dashboard. Fill in photos, title, description, price and location — it takes under 2 minutes.' },
  { q: 'Is it free to list items?', a: 'Yes. Posting listings is completely free on Ashimarket. We charge a small 3% platform fee only on completed transactions.' },
  { q: 'How do I pay for an item?', a: 'Payments are arranged directly between buyer and seller. You can use bank transfer, cash on delivery, or any method that both parties agree on.' },
  { q: 'What if an item is not as described?', a: 'You can open a dispute from your Order Details page within 30 days of delivery. Our team will review the evidence and mediate a resolution.' },
  { q: 'How do I make an offer?', a: 'On any listing that accepts offers, click "Make an Offer", enter your amount and an optional message. The seller has 48 hours to accept, decline, or counter.' },
  { q: 'Can I sell as an individual and a business?', a: 'Yes. You can register as both buyer and seller with the same account.' },
  { q: 'How do I delete a listing?', a: 'Go to Seller Dashboard → My Listings, click the ⋯ menu on the listing, and select Delete.' },
  { q: 'Why was my listing rejected?', a: 'Listings can be rejected if they contain prohibited items, misleading information, or violate our terms. Check your email or dashboard notifications for the reason.' },
];

export default function HelpPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-4">Help Center</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-12">
          Answers to the most common questions about Ashimarket.
        </p>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 cursor-pointer">
              <summary className="font-semibold text-slate-900 dark:text-slate-100 list-none flex items-center justify-between">
                {q}
                <span className="text-primary group-open:rotate-180 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Still need help?</p>
          <p className="text-sm text-slate-500 mb-4">Send us a message and we&apos;ll respond within 24 hours.</p>
          <Link href="/contact" className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
            Contact Support
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
