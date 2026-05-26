'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, message }) });
    setSending(false);
    if (res.ok) { setSent(true); setMessage(''); }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="w-full max-w-md">
        <Link href="/overview" className="text-xs font-bold text-sub hover:text-ink">← Back</Link>
        <h1 className="text-2xl font-extrabold mt-6 mb-1">Contact us</h1>
        <p className="text-sm text-sub mb-6">We'll get back within 24 hours. Or email <a className="text-brand underline" href="mailto:hello@sceneva.com">hello@sceneva.com</a>.</p>
        {sent ? (
          <div className="card p-7 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success grid place-items-center mx-auto mb-3 text-xl">✓</div>
            <p className="font-bold">Got it — talk soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-7 space-y-4">
            <div>
              <label className="label">Your email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@store.com" />
            </div>
            <div>
              <label className="label">How can we help?</label>
              <textarea className="input min-h-32 py-2.5" required value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Tell us what's going on…" />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full h-11">{sending ? 'Sending…' : 'Send message'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
