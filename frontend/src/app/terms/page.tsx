import { Footer } from '@/components/layout/Footer';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: May 2026</p>

        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Ashimarket, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">2. User Accounts</h2>
            <p>You must be at least 18 years old to use Ashimarket. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">3. Listings & Content</h2>
            <p>Sellers are solely responsible for the accuracy of their listings. Prohibited items include but are not limited to: illegal goods, counterfeit products, weapons, and adult content. Ashimarket reserves the right to remove any listing at its discretion.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">4. Transactions</h2>
            <p>Ashimarket facilitates connections between buyers and sellers but is not a party to any transaction. Payments are made directly between users. Ashimarket charges a platform fee of 3% on completed transactions.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">5. Disputes</h2>
            <p>In the event of a dispute, both parties should attempt to resolve it amicably. If unresolved, either party may open a dispute through the platform within 30 days of the transaction.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">6. Limitation of Liability</h2>
            <p>Ashimarket is not liable for any loss or damage arising from transactions between users, inaccurate listings, or any actions of third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">7. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
