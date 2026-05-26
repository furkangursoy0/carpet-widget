import { TrendingUp, Palette, Code2 } from 'lucide-react';

// Three short proof points under the hero. Titles do the work; the
// sub-line stays under ~50 characters so the row reads at a glance
// rather than asking the visitor to slow down and parse paragraphs.
const POINTS = [
  {
    Icon: Code2,
    title: 'One script install',
    body: 'A single tag in your theme. No plugin, no rebuild.',
  },
  {
    Icon: TrendingUp,
    title: 'Higher conversion',
    body: 'Doubts answered before checkout.',
  },
  {
    Icon: Palette,
    title: 'Made for your brand',
    body: 'Color, copy, and position — match your store.',
  },
];

export default function ProofStrip() {
  return (
    <div className="max-w-[1280px] mx-auto px-8 lg:px-16 mb-14">
      <div className="rounded-xl border border-line bg-white shadow-card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
      {POINTS.map(({ Icon, title, body }) => (
        <div key={title} className="flex items-start gap-3.5 px-6 py-5">
          <div className="w-10 h-10 rounded-full bg-brand-light grid place-items-center shrink-0">
            <Icon size={19} className="text-ink" strokeWidth={2.1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink text-[13px] font-bold leading-tight">{title}</p>
            <p className="text-sub text-[11.5px] leading-[16px] font-semibold mt-1">{body}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
