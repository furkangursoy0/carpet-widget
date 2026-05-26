import Image from 'next/image';
import Link from 'next/link';
import { UploadCloud, Check, RefreshCcw, Sparkles, Box, Brush, X, ChevronRight, Download, Share2, Camera, ArrowRight } from 'lucide-react';
import BeforeAfterCompare from './BeforeAfterCompare';

export default function FlowShowcase() {
  const accent = '#2458F5';
  return (
    <section className="bg-[#F8FAFC] px-8 lg:px-16 py-16">
      <div className="max-w-[1280px] mx-auto">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">
          For your shoppers · What they experience
        </p>
        <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight">
          From product page to a real room preview.
        </h2>
        <p className="text-sub text-base leading-[1.55] font-medium mt-4">
          Four screens, ten seconds — the journey from "I'm curious" to "I can see it in my room."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
        {[
          { n: 1, title: 'Upload Room Photo', Card: () => <StageUpload accent={accent} /> },
          { n: 2, title: 'Confirm Photo', Card: () => <StagePhoto accent={accent} /> },
          { n: 3, title: 'Generating Preview', Card: () => <StageGenerating accent={accent} /> },
          { n: 4, title: 'Before / After', Card: () => <StageResult accent={accent} /> },
        ].map(({ n, title, Card }, i, arr) => (
          <div key={title} className="relative flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-ink grid place-items-center">
                <span className="text-white text-[13px] font-extrabold">{n}</span>
              </div>
              <h3 className="text-ink text-[15px] font-extrabold tracking-tight">{title}</h3>
            </div>
            <div className="rounded-2xl border border-line bg-white shadow-card p-5 h-[460px] flex flex-col gap-3">
              <Card />
            </div>
            {i < arr.length - 1 ? (
              <div className="hidden xl:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-line shadow-card items-center justify-center">
                <ChevronRight size={14} className="text-brand" strokeWidth={2.8} />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Conversion handoff — after the prospect has seen the full
          shopper experience, give them the single button to start.
          Softer shadow than the hero CTA so the row doesn't shout. */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/signup"
          className="h-12 px-6 rounded-lg bg-brand text-white text-sm font-extrabold shadow-sm hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2"
        >
          Try it on your store
          <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
      </div>
    </section>
  );
}

function CardHeader({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/carpets/moroccan-oatmeal.jpg" alt="" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-extrabold tracking-wider" style={{ color: accent }}>VISUALIZE</p>
        <p className="text-ink text-xs font-extrabold truncate">Moroccan Oatmeal Rug</p>
      </div>
      <X size={14} className="text-sub" strokeWidth={2.2} />
    </div>
  );
}

function StageUpload({ accent }: { accent: string }) {
  return (
    <>
      <CardHeader accent={accent} />
      <div className="h-[260px] rounded-xl border border-dashed border-line bg-bg flex flex-col items-center justify-center px-4 py-4 gap-2">
        <div className="w-9 h-9 rounded-full grid place-items-center" style={{ backgroundColor: accent + '1A' }}>
          <UploadCloud size={18} color={accent} strokeWidth={2.2} />
        </div>
        <p className="text-ink text-[11px] font-bold text-center">Drop a room photo here</p>
        <p className="text-sub text-[9.5px] font-medium text-center leading-tight">or browse from your device · JPG, PNG, WEBP · max 10MB</p>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 h-[30px] rounded-md flex items-center justify-center gap-1.5" style={{ backgroundColor: accent }}>
          <UploadCloud size={12} color="white" strokeWidth={2.4} />
          <span className="text-white text-[10.5px] font-bold">Browse files</span>
        </div>
        <div className="flex-1 h-[30px] rounded-md border border-line bg-white flex items-center justify-center gap-1.5">
          <Camera size={12} className="text-ink" strokeWidth={2.2} />
          <span className="text-ink text-[10.5px] font-bold">Use camera</span>
        </div>
      </div>
      <div className="flex justify-center gap-3.5">
        {['Free', 'Instant', 'No sign-up'].map((t) => (
          <span key={t} className="text-sub text-[10px] font-semibold">{t}</span>
        ))}
      </div>
    </>
  );
}

function StagePhoto({ accent }: { accent: string }) {
  return (
    <>
      <CardHeader accent={accent} />
      <div className="h-[260px] rounded-xl bg-line overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/room-previews/room-after.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/80">
          <Check size={11} color="white" strokeWidth={3} />
          <span className="text-white text-[9px] font-bold">Photo ready</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 h-[30px] rounded-md border border-line bg-white flex items-center justify-center gap-1.5">
          <RefreshCcw size={12} className="text-ink" strokeWidth={2.2} />
          <span className="text-ink text-[10.5px] font-bold">Change photo</span>
        </div>
        <div className="flex-1 h-[30px] rounded-md flex items-center justify-center gap-1.5" style={{ backgroundColor: accent }}>
          <span className="text-white text-[10.5px] font-bold">Continue</span>
          <ChevronRight size={12} color="white" strokeWidth={2.4} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-1">
        <Check size={11} className="text-success" strokeWidth={2.6} />
        <span className="text-success text-[10px] font-bold">This is your room photo</span>
      </div>
    </>
  );
}

function StageGenerating({ accent }: { accent: string }) {
  // Mirrors the real widget's generating state: a soft pulse, the
  // status line, an indeterminate progress bar, and a privacy note.
  // No fake step buttons — what shoppers actually see.
  return (
    <>
      <CardHeader accent={accent} />
      <div className="flex-1 rounded-xl bg-bg flex flex-col items-center justify-center p-5 gap-3 min-h-[260px]">
        <div
          className="w-14 h-14 rounded-full grid place-items-center"
          style={{ backgroundColor: accent + '1A', animation: 'scenevaPulse 1.6s ease-in-out infinite' }}
        >
          <Sparkles size={24} color={accent} strokeWidth={2.1} fill={accent} />
        </div>
        <p className="text-ink text-[13px] font-extrabold text-center">Composing your room…</p>
        <p className="text-sub text-[10.5px] font-medium text-center -mt-1">Usually takes 8–20 seconds</p>
        <div className="w-full max-w-[180px] h-1.5 bg-line rounded-full overflow-hidden mt-1">
          <div
            className="h-full rounded-full"
            style={{ width: '30%', backgroundColor: accent, animation: 'scenevaProgress 1.8s ease-in-out infinite' }}
          />
        </div>
        <p className="text-sub text-[10px] font-semibold mt-1">🔒 Your photo never leaves the preview</p>
      </div>
      <style>{`
        @keyframes scenevaPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.06);opacity:0.85;} }
        @keyframes scenevaProgress { 0%{transform:translateX(-100%);} 100%{transform:translateX(400%);} }
      `}</style>
    </>
  );
}

function StageResult({ accent }: { accent: string }) {
  return (
    <>
      <CardHeader accent={accent} />
      <div className="h-[260px] rounded-xl overflow-hidden relative bg-line">
        <BeforeAfterCompare
          baseImage="/room-previews/room-after.png"
          overlayImage="/room-previews/room-before.png"
          beforeLabel="Original room"
          afterLabel="With rug"
          afterAccent={accent}
          small
        />
      </div>
      {/* Same modal action-bar pattern used in the hero: a compact
          icon-only refresh, then Share + Download with icon + text. */}
      <div className="flex gap-1.5">
        <div className="w-[30px] h-[30px] rounded-md border border-line bg-white grid place-items-center text-sub">
          <RefreshCcw size={12} strokeWidth={2.2} />
        </div>
        <div className="flex-1 h-[30px] rounded-md border border-line bg-white flex items-center justify-center gap-1.5">
          <Share2 size={12} className="text-ink" strokeWidth={2.2} />
          <span className="text-ink text-[10.5px] font-bold">Share</span>
        </div>
        <div className="flex-[1.5] h-[30px] rounded-md flex items-center justify-center gap-1.5" style={{ backgroundColor: accent }}>
          <Download size={12} color="white" strokeWidth={2.4} />
          <span className="text-white text-[10.5px] font-bold">Download</span>
        </div>
      </div>
    </>
  );
}
