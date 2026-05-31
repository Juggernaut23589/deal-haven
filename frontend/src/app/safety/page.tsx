import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, AlertTriangle, MapPin, MessageSquare } from 'lucide-react';

export const metadata = { title: 'Safety Tips' };

const TIPS = [
  {
    icon: MessageSquare,
    title: 'Communicate in-app',
    tips: [
      'Keep all communication on Ashimarket — avoid moving to WhatsApp or phone for deals.',
      'Be cautious of anyone who rushes you or asks for personal financial info.',
      'Do not share your bank account details in messages.',
    ],
  },
  {
    icon: MapPin,
    title: 'Meeting in person',
    tips: [
      'Always meet in a public place — busy markets, bank lobbies, or police stations.',
      'Bring a friend or family member when meeting for high-value items.',
      'Inspect the item thoroughly before handing over payment.',
      'Never go alone to meet a stranger at their home or yours.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Avoiding scams',
    tips: [
      'If a deal seems too good to be true, it probably is.',
      'Never pay in advance before seeing and confirming an item.',
      'Be wary of sellers who cannot meet in person or only want payment via transfer first.',
      'Report suspicious listings or users using the flag button.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Protecting your account',
    tips: [
      'Use a strong, unique password for your Ashimarket account.',
      'Never share your login details with anyone.',
      'Log out on shared or public devices.',
    ],
  },
];

export default function SafetyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-4">Safety Tips</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-12">
          Your safety is our priority. Follow these guidelines to trade confidently on Ashimarket.
        </p>

        <div className="space-y-10">
          {TIPS.map(({ icon: Icon, title, tips }) => (
            <div key={title} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
              </div>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
