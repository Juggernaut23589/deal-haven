'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Tag,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  ArrowRight,
  Shield,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Link Data ────────────────────────────────────────────────────────────────

const footerColumns: { heading: string; links: { label: string; href: Route }[] }[] = [
  {
    heading: 'Categories',
    links: [
      { label: 'Automobiles', href: '/category/automobiles' as Route },
      { label: 'Real Estate', href: '/category/real-estate' as Route },
      { label: 'Electronics', href: '/category/electronics' as Route },
      { label: 'Clothing & Fashion', href: '/category/clothing' as Route },
      { label: 'Furniture & Home', href: '/category/furniture-home' as Route },
      { label: 'Services', href: '/category/services' as Route },
      { label: 'Jobs & Gigs', href: '/category/jobs-gigs' as Route },
    ],
  },
  {
    heading: 'Buy',
    links: [
      { label: 'Browse All Listings', href: '/search' },
      { label: 'How Buying Works', href: '/how-it-works' as Route },
      { label: 'Buyer Protection', href: '/buyer-protection' as Route },
      { label: 'Make an Offer', href: '/how-it-works' as Route },
      { label: 'Auctions', href: '/how-it-works' as Route },
      { label: 'Track an Order', href: '/dashboard/orders' as Route },
      { label: 'Returns & Disputes', href: '/how-it-works' as Route },
    ],
  },
  {
    heading: 'Sell',
    links: [
      { label: 'Start Selling', href: '/listing/create' },
      { label: 'Seller Dashboard', href: '/seller' },
      { label: 'Seller Fees', href: '/how-it-works' as Route },
      { label: 'Seller Verification', href: '/how-it-works' as Route },
      { label: 'Promote a Listing', href: '/seller/promotions' as Route },
      { label: 'Shipping Guide', href: '/how-it-works' as Route },
      { label: 'Seller Payouts', href: '/seller/earnings' as Route },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Ashimarket', href: '/about' as Route },
      { label: 'Safety Tips', href: '/safety' as Route },
      { label: 'Help Center', href: '/help' as Route },
      { label: 'Contact Us', href: '/contact' as Route },
      { label: 'Careers', href: '/careers' as Route },
      { label: 'Press', href: '/press' as Route },
      { label: 'Blog', href: '/blog' as Route },
    ],
  },
];

const socialLinks = [
  { label: 'Twitter / X', href: 'https://twitter.com/ashimarket', Icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com/ashimarket', Icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com/ashimarket', Icon: Facebook },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/ashimarket', Icon: Linkedin },
];

// ─── Newsletter Form ──────────────────────────────────────────────────────────

function NewsletterForm() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Newsletter sign-up logic handled elsewhere
      setSubmitted(true);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
        Stay in the loop
      </h3>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        Get deal alerts, seller tips, and marketplace updates delivered to your inbox.
      </p>

      {submitted ? (
        <p className="flex items-center gap-2 text-success text-sm font-medium">
          <Shield className="h-4 w-4" aria-hidden="true" />
          You&apos;re subscribed. Welcome to Ashimarket!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className={cn(
              'flex-1 min-w-0 rounded-md border border-slate-700 bg-slate-800',
              'px-3 py-2 text-sm text-white placeholder:text-slate-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'focus-visible:border-primary transition-colors'
            )}
          />
          <button
            type="submit"
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-primary px-4 py-2',
              'text-sm font-medium text-white whitespace-nowrap',
              'hover:bg-primary-dark active:bg-primary-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              'transition-colors duration-150'
            )}
            aria-label="Subscribe to newsletter"
          >
            Subscribe
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-slate-900 text-slate-300 mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 group"
              aria-label="Ashimarket home"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary group-hover:bg-primary-dark transition-colors">
                <Tag className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-white">
                Deal<span className="text-primary-light">Haven</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your trusted marketplace for buying and selling everything — from everyday essentials
              to unique treasures. Secure payments, buyer protection, verified sellers.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg',
                    'bg-slate-800 text-slate-400',
                    'hover:bg-primary hover:text-white',
                    'transition-colors duration-150 focus-visible:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* App download nudge */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Smartphone className="h-4 w-4 text-primary-light shrink-0" aria-hidden="true" />
              <span>Available as a Progressive Web App — install from your browser.</span>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'text-sm text-slate-400 hover:text-white',
                        'transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:underline'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter row */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <NewsletterForm />

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 md:justify-end">
              {[
                { icon: Shield, text: 'Buyer Protection' },
                { icon: Mail, text: 'Secure Messaging' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-slate-400">
                  <Icon className="h-4 w-4 text-primary-light" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Ashimarket, Inc. All rights reserved.
          </p>

          <nav aria-label="Legal links">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1" role="list">
              {([
                { label: 'Terms of Service', href: '/terms' as Route },
                { label: 'Privacy Policy', href: '/privacy' as Route },
                { label: 'Cookie Policy', href: '/cookies' as Route },
                { label: 'Accessibility', href: '/accessibility' as Route },
                { label: 'Contact', href: '/contact' as Route },
              ] as { label: string; href: Route }[]).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-500 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
