import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">About Ashimarket</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Ashimarket is a modern Nigerian marketplace where buyers and sellers connect to trade goods and services across all categories — from electronics and vehicles to real estate and fashion.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
            Our mission is to make buying and selling in Nigeria simple, safe, and accessible to everyone. Whether you&apos;re clearing out your home, starting a business, or looking for your next great deal, Ashimarket is the place to be.
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4">How it works</h2>
          <ul className="space-y-3 text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">Browse</strong> — Search thousands of listings across all categories.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Connect</strong> — Message sellers directly and make offers.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Agree</strong> — Settle on a price and payment method privately.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Trade</strong> — Complete the transaction and leave a review.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
