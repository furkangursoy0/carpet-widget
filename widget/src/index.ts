// ═══════════════════════════════════════════════════════════════════
// SCENEVA WIDGET — vanilla TS, bundled to /public/widget/widget.js
//
// Loaded by merchants via:
//   <script async src="https://app.sceneva.com/widget/widget.js"
//           data-sceneva-key="..."></script>
//
// On boot:
//   1) Resolve script tag + read data-sceneva-key (with fallbacks)
//   2) Fetch widget config from /api/widget/:key
//   3) Wait for DOM ready, then detect the product image
//   4) Inject a styled floating button + modal
//   5) Re-detect on SPA route changes (Hydrogen, Next.js stores, etc.)
//   6) Handle upload → POST /api/visualize → render result
// ═══════════════════════════════════════════════════════════════════

import { detectProductImage, type DetectedProduct } from './detector';
import { createModal, type ModalApi } from './modal';
import { apiVisualize, apiEvent, fetchConfig, type WidgetConfig } from './api';

const BOOT_FLAG = '__scenevaBooted__';

(function boot() {
  // Idempotency: a merchant might paste the snippet twice; mount only once.
  if ((window as any)[BOOT_FLAG]) return;
  (window as any)[BOOT_FLAG] = true;

  const scriptTag = resolveScriptTag();
  if (!scriptTag) return console.warn('[Sceneva] script tag not found');

  const key = scriptTag.dataset.scenevaKey;
  if (!key) return console.warn('[Sceneva] data-sceneva-key missing');

  const apiBase = inferApiBase(scriptTag.src);

  fetchConfig(apiBase, key)
    .then((config) => {
      // Don't render the trigger when the widget is paused or its
      // monthly quota is exhausted — failing silently here is better
      // UX than letting shoppers upload a photo only to see a 402.
      if (config.status !== 'active') return;
      if (config.limit_reached) {
        console.info('[Sceneva] monthly quota reached — widget hidden');
        return;
      }

      // Expose a tiny event bus so merchants (and the optional
      // custom_script field) can react to widget lifecycle events
      // from their own analytics stack. Kept intentionally minimal —
      // just `on(event, cb)` and `off(event, cb)`.
      installEventBus();

      // Run the merchant-supplied custom_script (if any) in a try/catch
      // so a typo in their snippet never breaks the widget. The script
      // executes once at mount and has access to `window.sceneva`.
      if (config.custom_script) {
        try {
          // eslint-disable-next-line no-new-func
          new Function('sceneva', 'config', config.custom_script)((window as any).sceneva, config);
        } catch (err) {
          console.warn('[Sceneva] custom_script error:', err);
        }
      }

      whenReady(() => mount(apiBase, key, config));
    })
    .catch((err) => console.warn('[Sceneva] failed to load:', err));
})();

// Minimal pub/sub bus exposed as `window.sceneva`.
// We attach lazily and idempotently so two embed snippets on the same
// page (we discourage it, but it happens) share a single bus.
function installEventBus() {
  const w = window as any;
  if (w.sceneva && w.sceneva.__busInstalled) return;
  const listeners: Record<string, Array<(payload: any) => void>> = {};
  w.sceneva = {
    __busInstalled: true,
    on(event: string, cb: (payload: any) => void) {
      (listeners[event] = listeners[event] || []).push(cb);
    },
    off(event: string, cb: (payload: any) => void) {
      listeners[event] = (listeners[event] || []).filter((x) => x !== cb);
    },
    emit(event: string, payload: any) {
      (listeners[event] || []).forEach((cb) => {
        try { cb(payload); } catch (e) { console.warn('[Sceneva] listener error:', e); }
      });
    },
  };
}

// `document.currentScript` is reliable for classic scripts (including
// async ones), but falls back to querying the DOM if the runtime ever
// returns null — defensive belt + suspenders.
function resolveScriptTag(): HTMLScriptElement | null {
  const cur = document.currentScript as HTMLScriptElement | null;
  if (cur && cur.dataset.scenevaKey) return cur;
  return document.querySelector<HTMLScriptElement>('script[data-sceneva-key]');
}

function inferApiBase(scriptSrc: string): string {
  try {
    const u = new URL(scriptSrc);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'https://app.sceneva.com';
  }
}

function whenReady(fn: () => void) {
  if (document.readyState === 'complete') return fn();
  if (document.readyState === 'interactive') {
    // Most product images are already in the DOM by 'interactive', but a
    // few lazy-loaded themes need a brief delay to settle.
    setTimeout(fn, 50);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(fn, 50), { once: true });
}

// Detect with a small retry loop — handles lazy-loaded hero images that
// haven't downloaded yet at first paint.
function detectWithRetry(customSelector: string | null, tries = 4): Promise<DetectedProduct> {
  return new Promise((resolve) => {
    let attempt = 0;
    const tick = () => {
      const result = detectProductImage(customSelector);
      if (result.method !== 'none' || attempt >= tries) return resolve(result);
      attempt++;
      setTimeout(tick, 400 * attempt);
    };
    tick();
  });
}

async function mount(apiBase: string, key: string, config: WidgetConfig) {
  let product = await detectWithRetry(config.custom_image_selector);

  const btn = config.format === 'side-tab' ? buildSideTab(config) : buildFloatingButton(config);

  let modal: ModalApi | null = null;

  const openModal = () => {
    apiEvent(apiBase, {
      widget_key: key,
      event_type: 'opened',
      page_url: location.href,
      product_image_url: product.imageUrl,
      product_title: product.title,
    });
    const w = window as any;
    w.sceneva?.emit?.('opened', { product: { title: product.title, imageUrl: product.imageUrl, pageUrl: location.href } });
    if (!modal) {
      modal = createModal({
        accentColor: config.accent_color,
        productTitle: product.title,
        productImageUrl: product.imageUrl,
        language: config.language,
        onUpload: async (roomBase64, dims) => {
          const result = await apiVisualize(apiBase, {
            widget_key: key,
            room_image_base64: roomBase64,
            product_image_url: product.imageUrl,
            product_title: product.title,
            page_url: location.href,
            room_width: dims.width,
            room_height: dims.height,
          });
          // Fire a public 'generated' / 'error' event for analytics hooks.
          const w = window as any;
          if (w.sceneva?.emit) {
            w.sceneva.emit(result.ok ? 'generated' : 'error', {
              product: { title: product.title, imageUrl: product.imageUrl, pageUrl: location.href },
              result,
            });
          }
          return result;
        },
        onDownload: () => {
          apiEvent(apiBase, {
            widget_key: key,
            event_type: 'downloaded',
            page_url: location.href,
            product_image_url: product.imageUrl,
            product_title: product.title,
          });
          const w = window as any;
          w.sceneva?.emit?.('downloaded', { product: { title: product.title, imageUrl: product.imageUrl, pageUrl: location.href } });
        },
        onShare: () => {
          apiEvent(apiBase, {
            widget_key: key,
            event_type: 'shared',
            page_url: location.href,
            product_image_url: product.imageUrl,
            product_title: product.title,
          });
          const w = window as any;
          w.sceneva?.emit?.('shared', { product: { title: product.title, imageUrl: product.imageUrl, pageUrl: location.href } });
        },
      });
    } else {
      modal.setProduct({ title: product.title, imageUrl: product.imageUrl });
    }
    modal.open();
  };

  btn.addEventListener('click', openModal);
  document.body.appendChild(btn);

  // ── SPA support ───────────────────────────────────────────────────
  // Hook history navigation + URL polling so single-page stores
  // (Shopify Hydrogen, Next.js commerce, etc.) re-detect on route
  // change. We also re-run when the product image element mutates.
  let lastUrl = location.href;
  let lastImage = product.imageUrl;

  const refresh = async () => {
    const next = await detectWithRetry(config.custom_image_selector);
    if (!next.imageUrl || next.imageUrl === lastImage) return;
    product = next;
    lastImage = next.imageUrl;
    if (modal) modal.setProduct({ title: next.title, imageUrl: next.imageUrl });
  };

  hookHistory(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    setTimeout(refresh, 150);
  });

  const obs = new MutationObserver(() => {
    // Cheap throttle: only re-detect when at least 250 ms has passed
    // since the last attempt. Modal swap is idempotent.
    if (refreshScheduled) return;
    refreshScheduled = true;
    setTimeout(() => {
      refreshScheduled = false;
      refresh();
    }, 250);
  });
  let refreshScheduled = false;
  obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
}

function buildFloatingButton(config: WidgetConfig): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', config.button_text);
  btn.setAttribute('data-sceneva-trigger', '');
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const bottom = isMobile ? '88px' : '24px';
  const leftSide = config.position === 'bottom-left';
  const isCircle = config.button_shape === 'circle';
  // Circle = compact icon-only badge. Pill = full-width label + icon.
  Object.assign(btn.style, {
    position: 'fixed',
    bottom,
    right: leftSide ? 'auto' : '16px',
    left: leftSide ? '16px' : 'auto',
    width: isCircle ? '56px' : 'auto',
    minWidth: '52px',
    height: isCircle ? '56px' : '52px',
    paddingLeft: isCircle ? '0' : '20px',
    paddingRight: isCircle ? '0' : '20px',
    background: config.accent_color,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: isCircle ? '50%' : `${Math.max(8, Math.min(28, config.border_radius))}px`,
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor: 'pointer',
    boxShadow: `0 8px 24px ${hexToRgba(config.accent_color, 0.3)}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    zIndex: '2147483646',
    transition: 'transform 180ms cubic-bezier(0.4,0,0.2,1), box-shadow 180ms',
  } as CSSStyleDeclaration);
  btn.innerHTML = isCircle
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
       <span>${escapeHtml(config.button_text)}</span>`;
  btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-1px)'; });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'translateY(0)'; });
  return btn;
}

// Vertical tab anchored to the left or right edge of the viewport.
// Useful when the bottom-right area is already taken by a chat widget.
function buildSideTab(config: WidgetConfig): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', config.button_text);
  btn.setAttribute('data-sceneva-trigger', '');
  const leftSide = config.position === 'left';
  const r = Math.max(8, Math.min(20, config.border_radius));
  // Anchor to the chosen edge, rotate so the text reads upward, and
  // translate by 50% on the rotated axis so the tab stays vertically
  // centered regardless of its own height.
  const transform = leftSide
    ? `rotate(90deg) translate(-50%, -100%)`
    : `rotate(-90deg) translate(50%, -100%)`;
  const radius = leftSide
    ? `${r}px ${r}px 0 0`   // rotated 90deg cw → top-left/top-right become the visible "outside" corners
    : `${r}px ${r}px 0 0`;
  Object.assign(btn.style, {
    position: 'fixed',
    top: '50%',
    left: leftSide ? '0' : 'auto',
    right: leftSide ? 'auto' : '0',
    transformOrigin: leftSide ? 'top left' : 'top right',
    transform,
    background: config.accent_color,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: radius,
    height: '40px',
    padding: '0 18px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor: 'pointer',
    boxShadow: `0 6px 18px ${hexToRgba(config.accent_color, 0.28)}`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: '2147483646',
    whiteSpace: 'nowrap',
    transition: 'box-shadow 180ms',
  } as CSSStyleDeclaration);
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    <span>${escapeHtml(config.button_text)}</span>
  `;
  btn.addEventListener('mouseenter', () => {
    btn.style.boxShadow = `0 10px 26px ${hexToRgba(config.accent_color, 0.4)}`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.boxShadow = `0 6px 18px ${hexToRgba(config.accent_color, 0.28)}`;
  });
  return btn;
}

// Patch pushState/replaceState so SPA navigations notify our listener.
// We do this once per page; idempotent if hosted alongside other widgets.
function hookHistory(onChange: () => void) {
  const HOOK_KEY = '__scenevaHistoryHooked__';
  if (!(window as any)[HOOK_KEY]) {
    (window as any)[HOOK_KEY] = true;
    const wrap = (name: 'pushState' | 'replaceState') => {
      const orig = history[name];
      history[name] = function (this: History, ...args: any[]) {
        const ret = orig.apply(this, args as any);
        window.dispatchEvent(new Event('sceneva:locationchange'));
        return ret;
      } as any;
    };
    wrap('pushState');
    wrap('replaceState');
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('sceneva:locationchange')));
  }
  window.addEventListener('sceneva:locationchange', onChange);
}

function escapeHtml(s: string) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
