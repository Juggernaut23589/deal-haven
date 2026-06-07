import { Footer } from '@/components/layout/Footer';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: May 2026</p>

        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Information We Collect</h2>
            <p>We collect information you provide directly: name, email, phone number, profile photo, and listing details. We also collect usage data such as pages visited and search queries to improve the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate and improve the Ashimarket platform</li>
              <li>To facilitate transactions between buyers and sellers</li>
              <li>To send transactional notifications (orders, offers, messages)</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Information Sharing</h2>
            <p>We do not sell your personal data. We share only what is necessary: your display name and general location are visible on listings; your contact details are only shared with the other party in a confirmed transaction.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Data Security</h2>
            <p>We use industry-standard encryption and security practices to protect your data. Passwords are hashed and never stored in plain text.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@ashimarket.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
