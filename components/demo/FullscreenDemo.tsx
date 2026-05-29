'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  X, UploadCloud, Camera, Sparkles, Box, Brush, Check,
  RefreshCcw, Share2, Download, LockKeyhole, ShieldCheck, Zap, ChevronDown,
} from 'lucide-react';
import BeforeAfterCompare from '@/components/marketing/BeforeAfterCompare';

const ACCENT = '#2458F5';
const ACCENT_LIGHT = '#DBEAFE';
const ACCENT_TINT = '#EFF6FF';
const ACCENT_INK = '#1E3A8A';
const STAGES = ['Upload', 'Generating', 'Result'] as const;
type Stage = typeof STAGES[number];

export default function FullscreenDemo({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>('Upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const startGenerating = () => {
    setStage('Generating');
    setTimeout(() => setStage('Result'), 2400);
  };

  const handleFile = (dataUrl: string) => { setUploadedImage(dataUrl); startGenerating(); };
  const handleUseCamera = () => { setUploadedImage(null); startGenerating(); };
  const restart = () => { setStage('Upload'); setUploadedImage(null); };

  const stageIdx = STAGES.indexOf(stage);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/55 grid place-items-center p-6">
      <div className="w-full max-w-[1280px] h-[92vh] max-h-[820px] min-h-[620px] rounded-2xl bg-white border border-line shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-rail">
          <div className="flex items-center gap-3">
            <Image src="/carpets/moroccan-oatmeal.webp" alt="" width={50} height={50} className="w-[50px] h-[50px] rounded-[10px] object-cover" />
            <div>
              <p className="text-[10px] font-extrabold tracking-wider" style={{ color: ACCENT }}>VISUALIZE</p>
              <p className="text-ink text-lg font-extrabold tracking-tight mt-0.5">Moroccan Oatmeal Rug</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-bg grid place-items-center hover:bg-line transition-colors">
            <X size={20} className="text-ink" strokeWidth={2.2} />
          </button>
        </header>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-rail">
          <div className="flex items-center gap-6 flex-wrap">
            {STAGES.map((s, i) => {
              const active = i === stageIdx;
              const done = i < stageIdx;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-[26px] h-[26px] rounded-full grid place-items-center transition-colors ${active || done ? 'text-white' : 'text-sub'}`}
                    style={{ backgroundColor: active || done ? ACCENT : '#E2E8F0' }}>
                    {done ? <Check size={12} strokeWidth={3} /> : <span className="text-xs font-extrabold">{i + 1}</span>}
                  </div>
                  <span className={`text-[13px] ${active ? 'text-ink font-extrabold' : 'text-sub font-semibold'}`}>
                    {s === 'Upload' ? 'Upload room photo' : s === 'Generating' ? 'Generating' : 'Result'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 max-md:hidden">
            <span className="flex items-center gap-1.5 text-sub text-[11px] font-bold"><ShieldCheck size={14} strokeWidth={2.2} />Free</span>
            <span className="flex items-center gap-1.5 text-sub text-[11px] font-bold"><Zap size={14} strokeWidth={2.2} />Instant</span>
            <span className="flex items-center gap-1.5 text-sub text-[11px] font-bold"><Check size={14} strokeWidth={2.4} />No sign-up</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex max-lg:flex-col bg-white min-h-0">
          {/* Sidebar */}
          <aside className="w-full lg:w-[360px] p-6 gap-3.5 flex flex-col border-r border-rail">
            {stage === 'Upload' ? <SidebarUpload onFile={handleFile} onUseCamera={handleUseCamera} /> : null}
            {stage === 'Generating' ? <SidebarGenerating /> : null}
            {stage === 'Result' ? <SidebarResult /> : null}
          </aside>

          {/* Right column: preview + action row */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative bg-bg overflow-hidden">
              {stage === 'Upload' ? (
                <>
                  <span className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>
                    <Sparkles size={14} strokeWidth={2.4} />
                    Preview
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/room-previews/example-room-rug.webp" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 28%' }} />
                </>
              ) : null}
              {stage === 'Generating' ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedImage ?? '/room-previews/room-after.webp'} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 28%' }} />
                  <GeneratingOverlay />
                </>
              ) : null}
              {stage === 'Result' ? (
                <div className="w-full h-full relative flex items-center justify-center p-6">
                  <div className="relative h-full max-h-full" style={{ aspectRatio: '5 / 4' }}>
                    <BeforeAfterCompare
                      baseImage="/room-previews/room-after.webp"
                      overlayImage="/room-previews/room-before.webp"
                      afterLabel="With rug"
                      afterAccent={ACCENT}
                    />
                    <button onClick={() => setLightboxOpen(true)} aria-label="Expand preview" className="absolute bottom-3 right-3 z-10 h-8 px-3 rounded-full bg-white/90 backdrop-blur flex items-center gap-1.5 hover:bg-white transition-colors shadow-sm">
                      <Sparkles size={12} className="text-ink" strokeWidth={2.4} />
                      <span className="text-ink text-[11px] font-extrabold">Expand</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Action row — only meaningful once a preview exists */}
            {stage === 'Result' ? (
              <div className="flex gap-3 px-6 py-4 border-t border-rail">
                <button onClick={restart} className="flex-1 h-12 rounded-lg border border-line bg-white flex items-center justify-center gap-2 hover:bg-bg transition-colors">
                  <RefreshCcw size={15} className="text-ink" strokeWidth={2.2} />
                  <span className="text-ink text-[13px] font-bold">Start over</span>
                </button>
                <button className="flex-1 h-12 rounded-lg border border-line bg-white flex items-center justify-center gap-2 hover:bg-bg transition-colors">
                  <Share2 size={15} className="text-ink" strokeWidth={2.2} />
                  <span className="text-ink text-[13px] font-bold">Share</span>
                </button>
                <button className="flex-[2] h-12 rounded-lg text-white flex items-center justify-center gap-2 shadow-brand hover:opacity-95 transition-opacity" style={{ backgroundColor: ACCENT }}>
                  <Download size={15} strokeWidth={2.3} />
                  <span className="text-[13px] font-bold">Download image</span>
                </button>
              </div>
            ) : stage === 'Generating' ? (
              <div className="flex px-6 py-4 border-t border-rail">
                <button onClick={restart} className="w-full h-12 rounded-lg border border-line bg-white flex items-center justify-center gap-2 hover:bg-bg transition-colors">
                  <RefreshCcw size={15} className="text-ink" strokeWidth={2.2} />
                  <span className="text-ink text-[13px] font-bold">Cancel</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-center gap-2 px-6 py-2.5 border-t border-rail bg-[#FBFCFE]">
          <span className="flex items-center gap-1.5 text-sub text-[11px] font-semibold"><LockKeyhole size={13} strokeWidth={2.1} />Secure</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="flex items-center gap-1.5 text-sub text-[11px] font-semibold"><ShieldCheck size={13} strokeWidth={2.1} />Private</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="text-sub text-[11px] font-semibold">No sign-up required</span>
        </footer>
      </div>

      {/* Lightbox */}
      {lightboxOpen ? (
        <div className="fixed inset-0 z-[2000] bg-black/90 grid place-items-center p-6">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/15 grid place-items-center hover:bg-white/25 transition-colors">
            <X size={22} color="white" strokeWidth={2.2} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/room-previews/room-after.webp" alt="" className="max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] object-contain" />
        </div>
      ) : null}
    </div>
  );
}

function SidebarUpload({ onFile, onUseCamera }: { onFile: (dataUrl: string) => void; onUseCamera: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => { if (ev.target?.result) onFile(String(ev.target.result)); };
    r.readAsDataURL(file);
  };

  return (
    <>
      <button onClick={handlePick} className="min-h-[170px] rounded-xl border-[1.5px] border-dashed border-[#D8DEF5] bg-[#F5F7FE] flex flex-col items-center justify-center px-6 py-5 gap-2 hover:border-brand/40 transition-colors">
        <div className="w-13 h-13 rounded-full grid place-items-center" style={{ backgroundColor: ACCENT_LIGHT }}>
          <UploadCloud size={26} color={ACCENT} strokeWidth={2.1} />
        </div>
        <p className="text-ink text-[13px] font-bold">Drop a room photo here</p>
        <p className="text-sub text-xs font-medium">or browse from your device</p>
        <p className="text-[#94A3B8] text-[11px] font-medium">JPG, PNG, WEBP · max 10MB</p>
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      <button onClick={handlePick} className="h-12 rounded-lg flex items-center justify-center gap-2 shadow-brand hover:opacity-95 transition-opacity" style={{ backgroundColor: ACCENT }}>
        <UploadCloud size={15} color="white" strokeWidth={2.3} />
        <span className="text-white text-[13px] font-bold tracking-tight">Browse files</span>
      </button>
      <button onClick={onUseCamera} className="h-12 rounded-lg border border-line bg-white flex items-center justify-center gap-2 hover:bg-bg transition-colors">
        <Camera size={15} className="text-ink" strokeWidth={2.2} />
        <span className="text-ink text-[13px] font-bold">Use camera</span>
      </button>
      <div className="border-t border-line pt-3.5 space-y-2.5 mt-1">
        <p className="text-ink text-xs font-extrabold tracking-tight">Tips for best results</p>
        {[
          { Icon: Sparkles, t: 'Well-lit room' },
          { Icon: Box, t: 'Show floor area' },
          { Icon: Camera, t: 'Clear view of the space' },
        ].map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-2.5">
            <Icon size={14} className="text-sub" strokeWidth={2.2} />
            <span className="text-sub text-xs font-semibold">{t}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-start gap-2.5 rounded-lg p-3" style={{ backgroundColor: ACCENT_TINT }}>
        <LockKeyhole size={14} color={ACCENT} strokeWidth={2.2} className="shrink-0 mt-0.5" />
        <p className="text-[11px] leading-4 font-semibold" style={{ color: ACCENT_INK }}>
          Your photo is only used to generate your preview. It's never stored.
        </p>
      </div>
    </>
  );
}

function SidebarGenerating() {
  return (
    <>
      <div className="space-y-1.5">
        <p className="text-[10px] font-extrabold tracking-wider" style={{ color: ACCENT }}>STEP 2 OF 3</p>
        <p className="text-ink text-lg leading-6 font-extrabold tracking-tight">Composing your room…</p>
        <p className="text-sub text-[12.5px] leading-[18px] font-medium">We're placing the rug, matching lighting and perspective. Usually 8–20 seconds.</p>
      </div>
      <div className="border-t border-line pt-3.5 space-y-2.5 mt-1">
        <p className="text-ink text-xs font-extrabold tracking-tight">What's happening</p>
        {[
          { Icon: Sparkles, t: 'AI matches lighting' },
          { Icon: Box, t: 'Adjusts perspective' },
          { Icon: Brush, t: 'Scales rug to fit' },
        ].map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-2.5">
            <Icon size={14} className="text-sub" strokeWidth={2.2} />
            <span className="text-sub text-xs font-semibold">{t}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-start gap-2.5 rounded-lg p-3" style={{ backgroundColor: ACCENT_TINT }}>
        <LockKeyhole size={14} color={ACCENT} strokeWidth={2.2} className="shrink-0 mt-0.5" />
        <p className="text-[11px] leading-4 font-semibold" style={{ color: ACCENT_INK }}>
          Your photo stays on your device. We only use it to generate the preview.
        </p>
      </div>
    </>
  );
}

function SidebarResult() {
  return (
    <>
      <span className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>
        <Sparkles size={14} strokeWidth={2.4} />
        Preview ready
      </span>
      <p className="text-ink text-[17px] leading-[22px] font-extrabold tracking-tight">Your room with the rug</p>
      <p className="text-sub text-[12.5px] leading-[18px] font-medium">
        Drag the slider on the preview to compare before and after. Download the image to keep it or share it with someone.
      </p>
      <div className="border-t border-line pt-3.5 space-y-2.5 mt-1">
        {[
          { label: 'Rug', value: 'Moroccan Oatmeal' },
          { label: 'Size', value: "5' x 7'" },
          { label: 'Style', value: 'Vintage' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sub text-xs font-semibold">{label}</span>
            <span className="text-ink text-xs font-extrabold">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-start gap-2.5 rounded-lg p-3" style={{ backgroundColor: ACCENT_TINT }}>
        <LockKeyhole size={14} color={ACCENT} strokeWidth={2.2} className="shrink-0 mt-0.5" />
        <p className="text-[11px] leading-4 font-semibold" style={{ color: ACCENT_INK }}>
          Your room photo was processed locally and never stored on our servers.
        </p>
      </div>
    </>
  );
}

function GeneratingOverlay() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / 2200) * 100);
      setPct(Math.round(p));
      if (p >= 100) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  const STEPS = [
    { Icon: Sparkles, label: 'Matching lighting' },
    { Icon: Box, label: 'Adjusting perspective' },
    { Icon: Brush, label: 'Scaling rug to fit' },
  ];
  const activeIdx = pct >= 66 ? 2 : pct >= 33 ? 1 : 0;

  return (
    <div className="absolute inset-0 bg-black/55 grid place-items-center p-6">
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-7 flex flex-col items-center gap-3 shadow-cardHover">
        {/* Single soft tinted disc — no double ring, no brand shadow.
            The gentle scale pulse carries the "working" feeling. */}
        <div
          className="w-16 h-16 rounded-full grid place-items-center"
          style={{
            backgroundColor: `${ACCENT}1A`,
            animation: 'scenevaPulse 1.6s ease-in-out infinite',
          }}
        >
          <Sparkles size={26} color={ACCENT} strokeWidth={2.2} fill={ACCENT} />
        </div>
        <style>{`@keyframes scenevaPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.06);opacity:0.85;} }`}</style>
        <p className="text-ink text-[17px] font-extrabold text-center">Composing your room…</p>
        <p className="text-sub text-[12.5px] font-medium text-center -mt-1">Usually takes 8–20 seconds. Hang tight.</p>
        <div className="w-full h-2 rounded-full bg-bg overflow-hidden mt-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
        </div>
        <p className="text-[13px] font-extrabold" style={{ color: ACCENT }}>{pct}%</p>
        <div className="w-full space-y-1.5 mt-2">
          {STEPS.map((s, i) => {
            const isActive = i === activeIdx;
            const isDone = i < activeIdx;
            return (
              <div key={s.label} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${isActive ? '' : ''}`}
                style={{ backgroundColor: isActive ? `${ACCENT}12` : 'transparent' }}>
                <div className="w-[22px] h-[22px] rounded-full grid place-items-center" style={{ backgroundColor: isDone || isActive ? ACCENT : '#E2E8F0' }}>
                  {isDone ? <Check size={12} color="white" strokeWidth={3} /> : <s.Icon size={12} color={isActive ? 'white' : '#94A3B8'} strokeWidth={2.4} />}
                </div>
                <span className={`text-[12.5px] flex-1 ${(isActive || isDone) ? 'text-ink font-bold' : 'text-sub font-medium'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
