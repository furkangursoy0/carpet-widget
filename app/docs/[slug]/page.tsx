import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

function loadDocs() {
  return fs.readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace('.md', '');
      const raw = fs.readFileSync(path.join(DOCS_DIR, f), 'utf8');
      const { frontmatter, body } = parseFrontmatter(raw);
      return { slug, title: frontmatter.title || slug, order: Number(frontmatter.order ?? 99), body };
    })
    .sort((a, b) => a.order - b.order);
}

function parseFrontmatter(raw: string) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: {} as Record<string, string>, body: raw };
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const [k, ...v] = line.split(':');
    if (k) fm[k.trim()] = v.join(':').trim();
  }
  return { frontmatter: fm, body: m[2] };
}

// Tiny markdown → HTML (good enough for our docs; no XSS risk since we control the source)
function md(input: string): string {
  return input
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="bg-ink text-blue-200 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed my-4"><code>${escape(code.trim())}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="bg-bg px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-extrabold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-extrabold mt-8 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-extrabold mt-2 mb-4 tracking-tight">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-brand underline hover:text-brand-dark">$1</a>')
    .replace(/^- (.*$)/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/(\r?\n){2,}/g, '</p><p class="my-3 text-sm text-ink leading-relaxed">')
    .replace(/^(.+)$/m, '<p class="my-3 text-sm text-ink leading-relaxed">$1</p>');
}
function escape(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

export function generateStaticParams() {
  return loadDocs().map((d) => ({ slug: d.slug }));
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const docs = loadDocs();
  const doc = docs.find((d) => d.slug === params.slug);
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-6 py-12 flex gap-12">
        <aside className="w-56 shrink-0">
          <Link href="/overview" className="text-xs font-bold text-sub hover:text-ink">← Back to app</Link>
          <h3 className="text-xs font-extrabold tracking-wider text-sub mt-6 mb-3">DOCS</h3>
          <nav className="space-y-1">
            {docs.map((d) => (
              <Link key={d.slug} href={`/docs/${d.slug}`} className={`block px-3 py-2 rounded-md text-sm transition-colors ${d.slug === params.slug ? 'bg-brand-tint text-brand font-bold' : 'text-sub hover:bg-white hover:text-ink'}`}>
                {d.title}
              </Link>
            ))}
          </nav>
          <div className="mt-8 p-4 rounded-lg border border-line bg-white">
            <p className="text-xs font-bold text-ink">Need help?</p>
            <p className="text-xs text-sub mt-1.5 leading-relaxed">Email us at <a href="mailto:hello@sceneva.com" className="text-brand underline">hello@sceneva.com</a> — we read every message.</p>
          </div>
        </aside>
        <article className="flex-1 min-w-0" dangerouslySetInnerHTML={{ __html: md(doc.body) }} />
      </div>
    </main>
  );
}
