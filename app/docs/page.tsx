// /docs landing — visitors who land on the docs root see a directory
// of every available guide instead of a 404. The list comes from
// content/docs/*.md so it stays in sync with the [slug] route.

import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Docs — Sceneva',
  description: 'Install, customize, and troubleshoot the Sceneva room visualizer widget.',
};

type DocEntry = { slug: string; title: string; order: number; summary: string };

function loadDocs(): DocEntry[] {
  const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');
  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace('.md', '');
      const raw = fs.readFileSync(path.join(DOCS_DIR, f), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      const fm: Record<string, string> = {};
      if (m) {
        for (const line of m[1].split('\n')) {
          const [k, ...v] = line.split(':');
          if (k) fm[k.trim()] = v.join(':').trim();
        }
      }
      const body = m ? m[2] : raw;
      // First non-empty, non-heading line acts as the summary.
      const summary =
        body
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l && !l.startsWith('#') && !l.startsWith('---')) ?? '';
      return {
        slug,
        title: fm.title || slug,
        order: Number(fm.order ?? 99),
        summary: summary.replace(/[*_`]/g, '').slice(0, 180),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export default function DocsIndex() {
  const docs = loadDocs();

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-xs font-bold text-sub hover:text-ink">← Back to Sceneva</Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-light grid place-items-center">
            <BookOpen size={18} className="text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Docs</h1>
            <p className="text-sm text-sub mt-0.5">Everything you need to install and operate the widget.</p>
          </div>
        </div>

        <div className="grid gap-3 mt-10">
          {docs.map((d) => (
            <Link
              key={d.slug}
              href={`/docs/${d.slug}`}
              className="card p-5 hover:border-brand/40 hover:shadow-cardHover transition-all group"
            >
              <h2 className="text-base font-extrabold text-ink group-hover:text-brand transition-colors">{d.title}</h2>
              {d.summary ? (
                <p className="text-sm text-sub mt-1.5 leading-relaxed">{d.summary}</p>
              ) : null}
            </Link>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-xl border border-line bg-white">
          <p className="text-sm font-bold text-ink mb-1">Stuck on something not covered here?</p>
          <p className="text-sm text-sub">
            Email <a href="mailto:hello@sceneva.com" className="text-brand font-semibold underline">hello@sceneva.com</a> — we read every message and update the docs based on what trips merchants up.
          </p>
        </div>
      </div>
    </main>
  );
}
