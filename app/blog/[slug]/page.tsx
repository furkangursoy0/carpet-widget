// /blog/[slug] — same markdown rendering as /docs/[slug]; kept as its
// own copy because the two will diverge (blog wants share metadata,
// reading time, author bio block, etc.) and they're small.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

type Post = { slug: string; title: string; date: string; author: string; summary: string; body: string };

function loadPost(slug: string): Post | null {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
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
    body: m ? m[2] : raw,
  };
}

function md(input: string): string {
  return input
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="bg-ink text-blue-200 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed my-4"><code>${escape(code.trim())}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="bg-bg px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-extrabold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-extrabold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-extrabold mt-2 mb-4 tracking-tight">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-brand underline hover:text-brand-dark">$1</a>')
    .replace(/^- (.*$)/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/(\r?\n){2,}/g, '</p><p class="my-3 text-[15px] text-ink leading-relaxed">')
    .replace(/^(.+)$/m, '<p class="my-3 text-[15px] text-ink leading-relaxed">$1</p>');
}
function escape(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

export function generateStaticParams() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace('.md', '') }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = loadPost(params.slug);
  if (!post) return { title: 'Post not found · Sceneva' };
  return {
    title: post.title,
    description: post.summary || `Sceneva blog post: ${post.title}`,
    openGraph: { title: post.title, description: post.summary, type: 'article', authors: [post.author] },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = loadPost(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <article className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-xs font-bold text-sub hover:text-ink">← All posts</Link>
        <header className="mt-6 mb-8">
          <div className="flex items-center gap-2 text-xs text-sub font-semibold mb-3">
            {post.date ? <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time> : null}
            {post.date ? <span>·</span> : null}
            <span>{post.author}</span>
          </div>
        </header>
        <div className="prose-sceneva" dangerouslySetInnerHTML={{ __html: md(post.body) }} />

        <div className="mt-12 p-5 rounded-xl border border-line bg-white flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-ink">Ready to try it?</p>
            <p className="text-xs text-sub mt-0.5">Install the widget on your store in under 5 minutes.</p>
          </div>
          <Link href="/signup" className="btn-primary h-10">Get started</Link>
        </div>
      </article>
    </main>
  );
}
