// ═══════════════════════════════════════════════════════════════════
// Modal — upload + generating + result UI shown on customer sites
//
// Accessibility:
//   • role="dialog", aria-modal="true", aria-labelledby
//   • ESC closes
//   • Focus is trapped inside the dialog while open
//   • The triggering element is restored focus on close
// ═══════════════════════════════════════════════════════════════════

import type { VisualizeResult } from './api';

export type ModalApi = {
  open: () => void;
  close: () => void;
  destroy: () => void;
  setProduct: (p: { title: string; imageUrl: string }) => void;
};

type Args = {
  accentColor: string;
  productTitle: string;
  productImageUrl: string;
  onUpload: (roomBase64: string, dims: { width: number; height: number }) => Promise<VisualizeResult>;
  onDownload: () => void;
  onShare: () => void;
};

export function createModal(args: Args): ModalApi {
  const root = document.createElement('div');
  root.setAttribute('data-sceneva-root', '');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'sceneva-modal-title');
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'rgba(15, 23, 42, 0.55)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  } as CSSStyleDeclaration);

  root.innerHTML = template(args);
  document.body.appendChild(root);

  const closeBtn = root.querySelector<HTMLElement>('[data-x="close"]');
  const browseBtn = root.querySelector<HTMLElement>('[data-x="browse"]');
  const fileInput = root.querySelector<HTMLInputElement>('[data-x="file"]');
  const startOver = root.querySelectorAll<HTMLElement>('[data-x="startover"]');
  const downloadBtn = root.querySelector<HTMLElement>('[data-x="download"]');
  const shareBtn = root.querySelector<HTMLElement>('[data-x="share"]');
  const titleEl = root.querySelector<HTMLElement>('#sceneva-modal-title');
  const headerThumb = root.querySelector<HTMLImageElement>('[data-x="header-thumb"]');

  let stage: 'upload' | 'generating' | 'result' | 'error' = 'upload';
  let currentResultUrl = '';
  let previouslyFocused: Element | null = null;

  const show = (s: typeof stage, payload?: { resultUrl?: string; errorMsg?: string }) => {
    stage = s;
    ['upload', 'generating', 'result', 'error'].forEach((id) => {
      const el = root.querySelector<HTMLElement>(`[data-stage="${id}"]`);
      if (el) el.style.display = id === s ? 'flex' : 'none';
    });
    if (s === 'result' && payload?.resultUrl) {
      currentResultUrl = payload.resultUrl;
      const img = root.querySelector<HTMLImageElement>('[data-x="result-image"]');
      if (img) img.src = payload.resultUrl;
    }
    if (s === 'error' && payload?.errorMsg) {
      const p = root.querySelector<HTMLElement>('[data-x="error-msg"]');
      if (p) p.textContent = payload.errorMsg;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      api.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  closeBtn?.addEventListener('click', () => api.close());
  root.addEventListener('click', (e) => {
    if (e.target === root) api.close();
  });

  browseBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      show('error', { errorMsg: 'That photo is over 10 MB — please pick a smaller one.' });
      return;
    }
    show('generating');
    try {
      const base64 = await fileToBase64(file);
      const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
      const res = await args.onUpload(base64, dims);
      if (res.ok) show('result', { resultUrl: res.result_image_url });
      else show('error', { errorMsg: res.message || 'Generation failed. Please try a different photo.' });
    } catch {
      show('error', { errorMsg: 'Could not read that file. Try a different photo.' });
    }
  });

  startOver.forEach((el) => el.addEventListener('click', () => show('upload')));
  downloadBtn?.addEventListener('click', async () => {
    if (!currentResultUrl) return;
    args.onDownload();
    try {
      const blob = await (await fetch(currentResultUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sceneva-preview-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      window.open(currentResultUrl, '_blank');
    }
  });
  shareBtn?.addEventListener('click', async () => {
    args.onShare();
    if (navigator.share) {
      try {
        await navigator.share({ title: args.productTitle, url: currentResultUrl });
        return;
      } catch {
        /* user cancelled */
      }
    }
    if (navigator.clipboard && currentResultUrl) {
      navigator.clipboard.writeText(currentResultUrl);
    }
  });

  const api: ModalApi = {
    open: () => {
      previouslyFocused = document.activeElement;
      root.style.display = 'flex';
      show('upload');
      document.addEventListener('keydown', handleKeydown);
      // focus the primary CTA so keyboard users land in the right spot
      setTimeout(() => (browseBtn as HTMLElement | null)?.focus(), 50);
    },
    close: () => {
      root.style.display = 'none';
      document.removeEventListener('keydown', handleKeydown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    },
    destroy: () => {
      document.removeEventListener('keydown', handleKeydown);
      root.remove();
    },
    setProduct: ({ title, imageUrl }) => {
      args.productTitle = title;
      args.productImageUrl = imageUrl;
      if (titleEl) titleEl.textContent = title;
      if (headerThumb) headerThumb.src = imageUrl;
    },
  };
  return api;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}

function template({ accentColor, productTitle, productImageUrl }: Args) {
  const a = accentColor;
  return `
    <div style="width:100%;max-width:980px;max-height:96vh;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(15,23,42,0.30);display:flex;flex-direction:column;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #EBF0F7;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <img data-x="header-thumb" src="${productImageUrl}" style="width:42px;height:42px;border-radius:9px;object-fit:cover;background:#F4F7FB;" alt="">
          <div style="min-width:0;">
            <div style="font-size:10px;font-weight:800;letter-spacing:0.6px;color:${a};">VISUALIZE</div>
            <div id="sceneva-modal-title" style="font-size:15px;font-weight:800;color:#0F172A;margin-top:2px;">${escapeHtml(productTitle)}</div>
          </div>
        </div>
        <button data-x="close" aria-label="Close" style="width:32px;height:32px;border-radius:16px;background:#F1F5F9;border:none;cursor:pointer;display:grid;place-items:center;color:#64748B;font-size:18px;">×</button>
      </div>

      <!-- Body -->
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:420px;">
        <!-- Upload -->
        <div data-stage="upload" style="display:flex;flex:1;align-items:center;justify-content:center;padding:36px 24px;">
          <div style="text-align:center;max-width:380px;">
            <div style="width:56px;height:56px;border-radius:28px;background:${a}1A;display:grid;place-items:center;margin:0 auto 16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${a}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div style="font-size:18px;font-weight:800;color:#0F172A;">Drop a room photo</div>
            <div style="font-size:13px;color:#64748B;margin-top:6px;">JPG, PNG, WEBP · max 10 MB</div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;">
              <button data-x="browse" style="height:44px;padding:0 22px;background:${a};color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:13px;">Browse files</button>
            </div>
            <input data-x="file" type="file" accept="image/*" style="display:none;">
            <div style="display:flex;justify-content:center;gap:16px;margin-top:18px;color:#94A3B8;font-size:11px;font-weight:600;">
              <span>⚡ Instant</span><span>✓ No sign-up</span><span>🔒 Private link</span>
            </div>
          </div>
        </div>

        <!-- Generating -->
        <div data-stage="generating" style="display:none;flex:1;align-items:center;justify-content:center;padding:36px 24px;background:#F8FAFC;">
          <div style="text-align:center;">
            <div style="width:72px;height:72px;border-radius:36px;background:${a}1A;display:grid;place-items:center;margin:0 auto 14px;animation:scenevaPulse 1.4s ease-in-out infinite;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="${a}"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>
            </div>
            <div style="font-size:16px;font-weight:800;color:#0F172A;">Composing your room…</div>
            <div style="font-size:13px;color:#64748B;margin-top:6px;">Usually takes 8-20 seconds.</div>
            <div style="width:240px;height:6px;background:#E2E8F0;border-radius:3px;margin:18px auto 0;overflow:hidden;">
              <div style="width:30%;height:100%;background:${a};border-radius:3px;animation:scenevaProgress 2s ease-in-out infinite;"></div>
            </div>
          </div>
        </div>

        <!-- Result -->
        <div data-stage="result" style="display:none;flex:1;flex-direction:column;">
          <div style="flex:1;background:#F4F7FB;position:relative;overflow:hidden;">
            <img data-x="result-image" style="width:100%;height:100%;object-fit:contain;display:block;" alt="Your room with the rug">
            <div style="position:absolute;top:14px;left:14px;background:${a}1A;color:${a};padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;">✨ Preview ready</div>
          </div>
          <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid #EBF0F7;">
            <button data-x="startover" style="flex:1;height:42px;border:1px solid #E4EAF3;background:#fff;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">↺ Start over</button>
            <button data-x="share" style="flex:1;height:42px;border:1px solid #E4EAF3;background:#fff;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">↗ Share link</button>
            <button data-x="download" style="flex:2;height:42px;background:${a};color:#fff;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">⬇ Download image</button>
          </div>
        </div>

        <!-- Error -->
        <div data-stage="error" style="display:none;flex:1;align-items:center;justify-content:center;padding:36px 24px;">
          <div style="text-align:center;max-width:380px;">
            <div style="width:56px;height:56px;border-radius:28px;background:#FEE2E2;display:grid;place-items:center;margin:0 auto 14px;color:#DC2626;font-size:24px;">!</div>
            <div style="font-size:16px;font-weight:800;color:#0F172A;">Something went wrong</div>
            <div data-x="error-msg" style="font-size:13px;color:#64748B;margin-top:6px;">Please try a different photo.</div>
            <button data-x="startover" style="margin-top:18px;height:42px;padding:0 22px;background:${a};color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;">Try again</button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;padding:10px 20px;border-top:1px solid #EBF0F7;background:#FBFCFE;color:#94A3B8;font-size:11px;font-weight:600;">
        <span>🔒 Private link</span><span>·</span><span>Auto-deletes in 30 days</span><span>·</span><span>Your photo is never shared</span>
      </div>
    </div>

    <style>
      @keyframes scenevaPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.06);opacity:0.85;} }
      @keyframes scenevaProgress { 0%{transform:translateX(-100%);} 100%{transform:translateX(400%);} }
    </style>
  `;
}

function escapeHtml(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
