// /blog index. Markdown-driven like /docs — drop a file into
// content/blog and it shows up here automatically. Kept intentionally
// small for v1 (single launch post). When we have 5+ posts we'll
// paginate + add tag filters.

import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — Sceneva',
  description: 'Notes from the team building Sceneva — the AI room visualizer widget for rug retailers.',
};

type Post = { slug: string; title: string; date: string; author: string; summary: string; order: number };

function loadPosts(): Post[] {
  const dir = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace('.md', '');
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      const fm: Record<string, string> = {};
      if (m) {
        for (const line of m[1].split('\n')) {
          const [k, ...v] = line.split(':');
          if (k) fm[k.trim()] = v.join(':').trim();
        }
      }
      return {
        slug,
        title: fm.title || slug,
        date: fm.date || '',
        author: fm.author || 'Sceneva',
        summary: fm.summary || '',
        order: Number(fm.order ?? 99),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export default function BlogIndex() {
  const posts = loadPosts();

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-xs font-bold text-sub hover:text-ink">← Back to Sceneva</Link>

        <h1 className="text-3xl font-extrabold tracking-tight mt-6">Blog</h1>
        <p className="text-sm text-sub mt-2">Notes from building Sceneva. Updated when we ship something worth writing about.</p>

        <div className="grid gap-3 mt-10">
          {posts.length === 0 ? (
            <div className="card p-8 text-center text-sm text-sub">
              We haven't published anything here yet — check back soon.
            </div>
          ) : (
            posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card p-6 hover:border-brand/40 hover:shadow-cardHover transition-all group"
              >
                <div className="flex items-center gap-2 text-xs text-sub font-semibold mb-2">
                  {p.date ? <time dateTime={p.date}>{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time> : null}
                  {p.date ? <span>·</span> : null}
                  <span>{p.author}</span>
                </div>
                <h2 className="text-lg font-extrabold text-ink group-hover:text-brand transition-colors">{p.title}</h2>
                {p.summary ? <p className="text-sm text-sub mt-2 leading-relaxed">{p.summary}</p> : null}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand mt-4">
                  Read post <ArrowRight size={12} />
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
