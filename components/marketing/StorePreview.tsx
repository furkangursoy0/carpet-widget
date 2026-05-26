'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, User, ShoppingCart, Truck, ShieldCheck, LockKeyhole, ChevronRight, Star, Monitor, Sparkles, X, Move } from 'lucide-react';
import BeforeAfterCompare from './BeforeAfterCompare';

// Draggable wrapper: anchors to initial position; user can drag by the handle on top
function DraggablePanel({ initial, children }: { initial: { left: number; top: number }; children: (handleProps: any) => React.ReactNode }) {
  const [pos, setPos] = useState(initial);
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);

  useEffect(() => { setPos(initial); }, [initial.left, initial.top]);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { ox: pos.left, oy: pos.top, sx: e.clientX, sy: e.clientY };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { ox, oy, sx, sy } = dragRef.current;
    setPos({ left: ox + (e.clientX - sx), top: oy + (e.clientY - sy) });
  };
  const onUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <div style={{ position: 'absolute', left: pos.left, top: pos.top }}>
      {children({ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, style: { touchAction: 'none', cursor: dragRef.current ? 'grabbing' : 'grab' } })}
    </div>
  );
}

const T: Record<string, any> = {
  English:  { kicker: 'VISUALIZE', dropTitle: 'Drop a room photo here', dropSub: 'or browse from your device · JPG, PNG, WEBP · max 10MB', browseFiles: 'Browse files', useCamera: 'Use camera', free: 'Free', instant: 'Instant', noSignup: 'No sign-up' },
  'Türkçe': { kicker: 'GÖRSELLEŞTİR', dropTitle: 'Oda fotoğrafını buraya bırak', dropSub: 'veya cihazından seç · JPG, PNG, WEBP · maks 10MB', browseFiles: 'Dosya seç', useCamera: 'Kamera kullan', free: 'Ücretsiz', instant: 'Anında', noSignup: 'Üyelik yok' },
  'Español':{ kicker: 'VISUALIZAR', dropTitle: 'Suelta una foto de la habitación aquí', dropSub: 'o explora desde tu dispositivo · JPG, PNG, WEBP · máx 10MB', browseFiles: 'Explorar archivos', useCamera: 'Usar cámara', free: 'Gratis', instant: 'Al instante', noSignup: 'Sin registro' },
  'Français':{ kicker: 'VISUALISER', dropTitle: 'Déposez une photo de la pièce ici', dropSub: 'ou parcourir votre appareil · JPG, PNG, WEBP · max 10 Mo', browseFiles: 'Parcourir', useCamera: 'Caméra', free: 'Gratuit', instant: 'Instantané', noSignup: 'Sans inscription' },
  'Deutsch':{ kicker: 'VISUALISIEREN', dropTitle: 'Raumfoto hier ablegen', dropSub: 'oder vom Gerät auswählen · JPG, PNG, WEBP · max 10 MB', browseFiles: 'Datei wählen', useCamera: 'Kamera nutzen', free: 'Kostenlos', instant: 'Sofort', noSignup: 'Keine Anmeldung' },
  'Italiano':{ kicker: 'VISUALIZZA', dropTitle: 'Trascina una foto della stanza qui', dropSub: 'o sfoglia dal tuo dispositivo · JPG, PNG, WEBP · max 10 MB', browseFiles: 'Sfoglia', useCamera: 'Fotocamera', free: 'Gratis', instant: 'Istantaneo', noSignup: 'Senza registrazione' },
};

export default function StorePreview({
  widgetFormat, floatingPosition, floatingShape, floatingRadius, sideTabEdge,
  accent, borderRadius, buttonText, widgetMode, previewState, language, forceInline,
}: any) {
  const t = T[language] || T.English;
  const isFloating = !forceInline && widgetFormat === 'Floating Button';
  const isSideTab = !forceInline && widgetFormat === 'Side Tab';
  const showInline = !isFloating && !isSideTab;
  const showUploadModal = previewState === 'Open';
  const showResultModal = previewState === 'Result';
  const isDark = widgetMode === 'Dark';

  return (
    <div className="min-h-[720px] rounded-xl border border-[#EBF0F7] bg-white overflow-hidden relative">
      {/* Store nav */}
      <div className="h-[68px] border-b border-[#EBF0F7] px-5 flex items-center justify-between">
        <p className="text-ink text-[19px] font-extrabold tracking-[0.4em] min-w-[170px]">NOMAD RU...</p>
        <div className="flex items-center gap-5 max-md:hidden">
          {['SHOP ALL', 'RUGS', 'COLLECTIONS', 'ABOUT', 'JOURNAL'].map((t) => (
            <span key={t} className="text-ink text-[9.5px] font-bold tracking-wider">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-3.5">
          <Search size={19} className="text-[#020617]" strokeWidth={2} />
          <User size={18} className="text-[#020617]" strokeWidth={2} />
          <div className="relative">
            <ShoppingCart size={19} className="text-[#020617]" strokeWidth={2} />
            <span className="absolute -right-2 -top-2 min-w-[16px] h-4 rounded-full bg-ink text-white text-[9px] font-extrabold leading-4 text-center px-1">2</span>
          </div>
        </div>
      </div>

      <p className="text-[#94A3B8] text-[11px] font-medium mx-5 mt-5">Home  ›  Rugs  ›  Moroccan Oatmeal Rug</p>

      <div className="flex gap-4 px-5 pt-5 pb-6 max-lg:flex-col">
        <div className="flex flex-col gap-3 max-lg:flex-row max-lg:overflow-x-auto">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-[62px] h-[78px] rounded border ${i === 0 ? 'border-2 border-ink' : 'border-[#EBF0F7]'} bg-[#F4F7FB] overflow-hidden shrink-0`}>
              <Image src="/carpets/moroccan-oatmeal.jpg" alt="" width={62} height={78} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="w-[290px] h-[420px] rounded-lg overflow-hidden bg-[#F4F7FB] relative shrink-0">
          <Image src="/carpets/moroccan-oatmeal.jpg" alt="" fill className="object-cover" />
        </div>

        <div className="flex-1 min-w-[270px] pt-1.5">
          <p className="text-ink text-2xl leading-7 font-extrabold tracking-tight">Moroccan Oatmeal Rug</p>
          <div className="flex items-center gap-0.5 mt-3">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className="text-amber-500" fill="currentColor" />)}
            <span className="text-sub text-xs font-medium ml-1.5">(128 reviews)</span>
          </div>
          <p className="text-ink text-2xl font-bold mt-4">$599.00</p>
          <p className="text-[#94A3B8] text-[11px] font-medium mt-1.5">Tax included. Shipping calculated at checkout.</p>
          <p className="text-ink text-xs font-bold mt-5 mb-2">Size</p>
          <div className="h-11 rounded-lg border border-line bg-white flex items-center justify-between px-3.5">
            <span className="text-ink text-[13px] font-semibold">5' x 7'</span>
            <ChevronRight size={14} className="text-ink rotate-90" strokeWidth={2.2} />
          </div>

          {showInline ? (
            <div className="mt-5 relative">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 rounded-full px-3.5 py-1 text-white text-[10px] font-bold z-10 shadow-card" style={{ backgroundColor: accent }}>
                Inline · drops where you embed the div
              </span>
              <div className="min-h-[68px] rounded-xl border-2 flex items-center gap-3.5 px-4" style={{ borderColor: accent, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderRadius: borderRadius / 2 }}>
                <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: isDark ? '#1E293B' : `${accent}14` }}>
                  <Monitor size={22} color={isDark ? accent : accent} strokeWidth={2.2} />
                </div>
                <span className="flex-1 text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : accent }}>{buttonText || 'See this rug in your room'}</span>
                <Sparkles size={15} color={isDark ? '#F8FAFC' : accent} strokeWidth={2.4} />
              </div>
            </div>
          ) : null}

          <button className="h-[54px] w-full rounded-lg bg-ink text-white text-[15px] font-bold mt-4">Add to Cart</button>
          {[
            { Icon: Truck, t: 'Free shipping', b: 'On all orders over $100' },
            { Icon: ShieldCheck, t: '30-day returns', b: 'Hassle-free returns' },
            { Icon: LockKeyhole, t: 'Secure checkout', b: 'Your data is protected' },
          ].map(({ Icon, t, b }, i) => (
            <div key={t} className={`flex items-center gap-4 py-3 ${i < 2 ? 'border-b border-bg' : ''}`}>
              <Icon size={27} className="text-ink" strokeWidth={1.8} />
              <div>
                <p className="text-ink text-[12.5px] font-bold">{t}</p>
                <p className="text-[#94A3B8] text-[11px] font-medium mt-0.5">{b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating button overlay — always rendered so it stays anchored
          even when the upload / result modal is open on top. */}
      {isFloating ? (
        <div className={`absolute bottom-7 ${floatingPosition === 'Bottom Left' ? 'left-5' : 'right-5'} flex flex-col items-center gap-3`}>
          <span className="rounded-lg px-3 py-1.5 text-[11px] font-bold bg-brand-tint" style={{ color: accent }}>
            Floating · {floatingPosition}
          </span>
          <div
            className="min-w-[270px] h-14 flex items-center justify-center gap-3 px-5 shadow-brand"
            style={{
              backgroundColor: accent,
              borderRadius: floatingShape === 'Circle' ? 9999 : floatingRadius,
              minWidth: floatingShape === 'Circle' ? 58 : 270,
            }}
          >
            <Monitor size={21} color="white" strokeWidth={2.1} />
            {floatingShape === 'Circle' ? null : <span className="text-white text-sm font-bold tracking-tight">{buttonText || 'See this rug in your room'}</span>}
          </div>
        </div>
      ) : null}

      {/* Side Tab overlay — always rendered for the same reason. */}
      {isSideTab ? (
        <SideTab edge={sideTabEdge} accent={accent} label={buttonText || 'Try in your room'} radius={floatingRadius} />
      ) : null}

      {/* Upload modal */}
      {showUploadModal ? (
        <UploadModal accent={accent} t={t} widgetMode={widgetMode} />
      ) : null}

      {/* Result modal */}
      {showResultModal ? (
        <ResultModal accent={accent} t={t} widgetMode={widgetMode} />
      ) : null}
    </div>
  );
}

function SideTab({ edge, accent, label, radius }: { edge: string; accent: string; label: string; radius: number }) {
  const isVertical = edge === 'Right' || edge === 'Left';
  // Mirror the runtime clamp: side tab uses a softer max so it never
  // looks like a floating pill when the user cranks the slider high.
  const r = Math.max(0, Math.min(20, radius));
  const pos: any = { position: 'absolute' };
  if (edge === 'Right') { pos.right = 0; pos.top = '38%'; }
  else if (edge === 'Left') { pos.left = 0; pos.top = '38%'; }
  else if (edge === 'Top') { pos.top = 69; pos.left = '50%'; pos.transform = 'translateX(-65px)'; }
  else { pos.bottom = 0; pos.left = '50%'; pos.transform = 'translateX(-65px)'; }
  // Use four corner longhands so we can flatten the anchored edge
  // without React complaining about mixing shorthand + longhand.
  const tl = edge === 'Left' || edge === 'Top' ? 0 : r;
  const tr = edge === 'Right' || edge === 'Top' ? 0 : r;
  const bl = edge === 'Left' || edge === 'Bottom' ? 0 : r;
  const br = edge === 'Right' || edge === 'Bottom' ? 0 : r;
  return (
    <div style={pos}>
      <div className="flex items-center gap-2 px-4 py-2.5 shadow-card" style={{
        backgroundColor: accent,
        borderTopLeftRadius: tl,
        borderTopRightRadius: tr,
        borderBottomLeftRadius: bl,
        borderBottomRightRadius: br,
        flexDirection: isVertical ? 'column' : 'row',
        minWidth: isVertical ? 36 : 130,
      }}>
        <Sparkles size={14} color="white" strokeWidth={2.3} />
        <span className="text-white text-xs font-bold tracking-tight" style={isVertical ? ({ writingMode: 'vertical-rl' } as any) : undefined}>
          {label}
        </span>
      </div>
    </div>
  );
}

function UploadModal({ accent, t, widgetMode }: { accent: string; t: any; widgetMode: 'Light' | 'Dark' }) {
  const isDark = widgetMode === 'Dark';
  const surface = isDark ? '#0F172A' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  return (
    <DraggablePanel initial={{ left: 32, top: 96 }}>
      {(handle) => (
    <div className="w-[388px] rounded-2xl border border-line p-5 shadow-cardHover space-y-4 relative" style={{ backgroundColor: surface }}>
      {/* Drag handle */}
      <div {...handle} className="absolute -top-0 left-0 right-0 h-6 rounded-t-2xl flex items-center justify-center gap-1.5 text-sub hover:text-ink" title="Drag to move">
        <Move size={11} strokeWidth={2.4} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Drag</span>
      </div>
      <button className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full grid place-items-center z-10">
        <X size={16} className={isDark ? 'text-[#94A3B8]' : 'text-sub'} strokeWidth={2.2} />
      </button>
      <div className="flex items-center gap-3 pr-8 pt-3">
        <Image src="/carpets/moroccan-oatmeal.jpg" alt="" width={44} height={44} className="w-11 h-11 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: accent }}>{t.kicker}</p>
          <p className="text-base font-extrabold tracking-tight truncate" style={{ color: textPrimary }}>Moroccan Oatmeal Rug</p>
        </div>
      </div>
      <div className="min-h-[152px] rounded-xl border-2 border-dashed border-[#CBD5E1] bg-bg flex flex-col items-center justify-center px-6 py-5 gap-2">
        <div className="w-11 h-11 rounded-full grid place-items-center" style={{ backgroundColor: accent + '1A' }}>
          <Monitor size={22} color={accent} strokeWidth={2.1} />
        </div>
        <p className="text-[13px] font-bold text-center" style={{ color: textPrimary }}>{t.dropTitle}</p>
        <p className="text-[11px] leading-[15px] font-medium text-center" style={{ color: textMuted }}>{t.dropSub}</p>
      </div>
      <div className="flex gap-2.5">
        <button className="flex-1 h-10 rounded-lg flex items-center justify-center gap-1.5" style={{ backgroundColor: accent }}>
          <Monitor size={14} color="white" strokeWidth={2.4} />
          <span className="text-white text-xs font-bold">{t.browseFiles}</span>
        </button>
        <button className="flex-1 h-10 rounded-lg border border-line bg-white flex items-center justify-center gap-1.5">
          <Monitor size={14} className="text-ink" strokeWidth={2.2} />
          <span className="text-ink text-xs font-bold">{t.useCamera}</span>
        </button>
      </div>
      <div className="flex justify-center gap-4">
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: textMuted }}><ShieldCheck size={12} strokeWidth={2.4} />{t.free}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: textMuted }}>⚡ {t.instant}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: textMuted }}>✓ {t.noSignup}</span>
      </div>
    </div>
      )}
    </DraggablePanel>
  );
}

function ResultModal({ accent, t, widgetMode }: { accent: string; t: any; widgetMode: 'Light' | 'Dark' }) {
  const isDark = widgetMode === 'Dark';
  const surface = isDark ? '#0F172A' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  return (
    <DraggablePanel initial={{ left: 32, top: 128 }}>
      {(handle) => (
    <div className="w-[394px] rounded-2xl border border-line p-4 shadow-cardHover relative" style={{ backgroundColor: surface }}>
      <div {...handle} className="absolute -top-0 left-0 right-0 h-6 rounded-t-2xl flex items-center justify-center gap-1.5 text-sub hover:text-ink" title="Drag to move">
        <Move size={11} strokeWidth={2.4} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Drag</span>
      </div>
      <div className="flex items-center justify-between mb-3 pt-3">
        <p className="text-base font-extrabold tracking-tight" style={{ color: textPrimary }}>See this rug in your room</p>
        <X size={16} className={isDark ? 'text-[#F8FAFC]' : 'text-ink'} strokeWidth={2.1} />
      </div>
      <div className="h-[254px] rounded-lg overflow-hidden relative">
        <BeforeAfterCompare
          baseImage="/room-previews/room-after.png"
          overlayImage="/room-previews/room-before.png"
          beforeLabel="Before"
          afterLabel="After"
          afterAccent={accent}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-ink text-[13px] font-extrabold">5' x 7'</span>
        <button className="h-[34px] px-4 rounded-lg border" style={{ borderColor: accent }}>
          <span className="text-xs font-extrabold" style={{ color: accent }}>Change size</span>
        </button>
      </div>
    </div>
      )}
    </DraggablePanel>
  );
}
