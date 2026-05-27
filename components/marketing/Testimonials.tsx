import { Star } from 'lucide-react';

const TESTIMONIALS = [
  { quote: 'Customers stopped asking if a product would work in their room. They can finally see it themselves.', name: 'Ava Martin', role: 'Founder, Tulum Rugs' },
  { quote: 'The widget turned our product pages into a buying assistant without rebuilding the store.', name: 'Daniel Lee', role: 'CEO, Nordic Loom' },
  { quote: 'Setup was quick, and our team could measure which products shoppers actually visualized.', name: 'Priya Mehta', role: 'Co-founder, Loom & Co.' },
];

export default function Testimonials() {
  return (
    <section className="bg-[#F1F5F9] px-8 lg:px-16 py-11">
      <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.05fr_1fr_1fr_1fr] gap-3.5 items-stretch">
      <div className="flex flex-col justify-center">
        <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">Built with store owners in mind</p>
        <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight">Made for retailers who sell visual products online.</h2>
        <div className="flex items-center gap-2 mt-5">
          {['AM', 'DL', 'PM'].map((a) => (
            <span key={a} className="w-7 h-7 rounded-full bg-brand-light text-ink text-[10px] font-bold grid place-items-center">{a}</span>
          ))}
          <span className="text-sub text-xs font-bold">+250</span>
        </div>
      </div>
      {TESTIMONIALS.map((t) => (
        <div key={t.name} className="rounded-xl bg-white border border-line p-5">
          <div className="flex gap-0.5 mb-2.5">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className="text-brand" fill="currentColor" />)}
          </div>
          <p className="text-ink text-[13px] leading-5 font-bold">"{t.quote}"</p>
          <p className="text-ink text-xs font-bold mt-3.5">— {t.name}</p>
          <p className="text-sub text-[11px] font-bold mt-1">{t.role}</p>
        </div>
      ))}
      </div>
    </section>
  );
}
