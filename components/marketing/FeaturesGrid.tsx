import { Image as ImageIcon, Layers3, Code2, BarChart3 } from 'lucide-react';

const FEATURES = [
  { Icon: ImageIcon, title: 'Product-page visualizer', body: "AI places the selected rug into the shopper's uploaded room photo." },
  { Icon: Layers3, title: 'Variant-aware previews', body: 'Pass product ID, title, price, image, size, and variant data through the embed.' },
  { Icon: Code2, title: 'One script install', body: 'Paste the snippet into theme HTML or install a plugin wrapper later.' },
  { Icon: BarChart3, title: 'Store insights', body: 'Show which products get previewed, saved, and pushed back to cart.' },
];

export default function FeaturesGrid() {
  return (
    <section className="px-8 lg:px-16 pb-14">
      <div className="mb-5 max-w-[480px]">
        <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">Built for retail</p>
        <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight">
          A product-page widget built for online retailers.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {FEATURES.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-line bg-white p-5 min-h-[196px] hover:shadow-cardHover transition-shadow">
            <div className="w-11 h-11 rounded-full bg-brand-light grid place-items-center mb-4">
              <Icon size={22} className="text-ink" strokeWidth={1.9} />
            </div>
            <p className="text-ink text-base font-bold">{title}</p>
            <p className="text-sub text-xs leading-5 font-semibold mt-2.5">{body}</p>
            <p className="text-brand text-[11px] font-bold mt-4">Learn more</p>
          </div>
        ))}
      </div>
    </section>
  );
}
