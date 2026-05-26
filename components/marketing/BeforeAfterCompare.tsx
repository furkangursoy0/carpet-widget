'use client';

import { useRef, useState } from 'react';

export default function BeforeAfterCompare({
  baseImage,
  overlayImage,
  beforeLabel = 'Original room',
  afterLabel = 'With product',
  afterAccent = '#2458F5',
  small,
}: {
  baseImage: string;
  overlayImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  afterAccent?: string;
  small?: boolean;
}) {
  const [pct, setPct] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    const move = (ev: PointerEvent) => {
      if (!dragging.current || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const next = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
      setPct(next);
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    move(e.nativeEvent);
  };

  const labelClass = small ? 'text-[9px] px-1.5 py-1' : 'text-[11px] px-2 py-1.5';

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden bg-[#F1F5F9] select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={baseImage} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={overlayImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
        draggable={false}
      />
      <div className="absolute top-0 bottom-0 w-0.5 -ml-px bg-white" style={{ left: `${pct}%` }}>
        <div
          onPointerDown={startDrag}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 cursor-ew-resize w-8 h-8 rounded-full bg-white shadow-[0_3px_10px_rgba(15,23,42,0.18)] grid place-items-center text-[16px] text-ink"
          aria-label="Drag to compare"
        >
          ⇆
        </div>
      </div>
      {beforeLabel ? (
        <span className={`absolute top-2 left-2 rounded bg-black/75 text-white font-extrabold ${labelClass}`}>{beforeLabel}</span>
      ) : null}
      {afterLabel ? (
        <span className={`absolute top-2 right-2 rounded text-white font-extrabold ${labelClass}`} style={{ backgroundColor: afterAccent }}>{afterLabel}</span>
      ) : null}
    </div>
  );
}
