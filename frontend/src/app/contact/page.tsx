'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
import { useToast } from '@/store/uiStore';

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast.success('Message sent!', 'We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-4">Contact Us</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-12">
          Have a question or issue? We&apos;re here to help.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact options */}
          <div className="space-y-4">
            {[
              { icon: HelpCircle, title: 'Help Center', desc: 'Find answers to common questions', href: '/help', label: 'Browse FAQs' },
              { icon: MessageSquare, title: 'Safety Tips', desc: 'Stay safe while trading', href: '/safety', label: 'View Tips' },
              { icon: Mail, title: 'Email Us', desc: 'support@ashimarket.com', href: 'mailto:support@ashimarket.com', label: 'Send Email' },
            ].map(({ icon: Icon, title, desc, href, label }) => (
              <div key={title} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">{desc}</p>
                <Link href={href as import('next').Route} className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                  {label} →
                </Link>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-6">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Send us a message</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="What is this about?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                rows={5}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Describe your issue or question in detail..."
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              {sending ? 'Sending…' : 'Send Message'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
