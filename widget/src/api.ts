// ═══════════════════════════════════════════════════════════════════
// Widget → Sceneva API client (browser)
// ═══════════════════════════════════════════════════════════════════

export type WidgetConfig = {
  embed_key: string;
  format: 'floating-button' | 'side-tab';
  position: 'bottom-right' | 'bottom-left' | 'right' | 'left';
  accent_color: string;
  border_radius: number;
  button_text: string;
  button_shape: 'pill' | 'circle';
  status: 'active' | 'paused';
  limit_reached: boolean;
  custom_image_selector: string | null;
};

export type VisualizeOk = { ok: true; result_image_url: string; generation_id: string };
export type VisualizeErr = {
  ok: false;
  error: 'limit_reached' | 'invalid_key' | 'paused' | 'forbidden_origin' | 'rate_limited' | 'generation_failed';
  message: string;
};
export type VisualizeResult = VisualizeOk | VisualizeErr;

export async function fetchConfig(apiBase: string, key: string): Promise<WidgetConfig> {
  const res = await fetch(`${apiBase}/api/widget/${encodeURIComponent(key)}`, { credentials: 'omit' });
  if (!res.ok) throw new Error(`config fetch ${res.status}`);
  return (await res.json()) as WidgetConfig;
}

export async function apiVisualize(
  apiBase: string,
  body: {
    widget_key: string;
    room_image_base64: string;
    product_image_url: string;
    product_title?: string;
    page_url?: string;
    room_width?: number;
    room_height?: number;
  },
): Promise<VisualizeResult> {
  const res = await fetch(`${apiBase}/api/visualize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await res.json()) as VisualizeResult;
}

export function apiEvent(
  apiBase: string,
  body: {
    widget_key: string;
    event_type: 'opened' | 'downloaded' | 'shared' | 'error';
    page_url?: string;
    product_image_url?: string;
    product_title?: string;
    meta?: Record<string, unknown>;
  },
): void {
  try {
    const url = `${apiBase}/api/event`;
    const payload = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // swallow
  }
}
