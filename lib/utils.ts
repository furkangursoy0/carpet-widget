import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function parseDeviceFromUA(ua: string | null): 'desktop' | 'mobile' | 'tablet' {
  if (!ua) return 'desktop';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobile|iPhone|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

// ───── URL / domain helpers ─────────────────────────────────────────
// We store only origin + pathname for analytics. Query strings often
// carry UTM tags, session IDs, or e-mail addresses — none of which the
// merchant needs to see the popular pages on their store.

export function sanitizePageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`;
  } catch {
    return null;
  }
}

export function extractHost(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return u.host.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

// From a registered store_url, build the default allow-list.
// nomadrugs.com  →  ['nomadrugs.com', 'www.nomadrugs.com']
export function defaultAllowedDomains(storeUrl: string | null | undefined): string[] {
  const host = extractHost(storeUrl);
  if (!host) return [];
  return [host, `www.${host}`];
}

export function originAllowed(origin: string | null, allowedDomains: string[]): boolean {
  if (!allowedDomains?.length) return false;
  const host = extractHost(origin);
  if (!host) return false;
  return allowedDomains.some((d) => {
    const norm = d.toLowerCase().replace(/^www\./, '');
    return host === norm || host === `www.${norm}` || host.endsWith(`.${norm}`);
  });
}

// Map an uploaded room photo's dimensions to the closest supported
// gpt-image-1 output size, so a landscape room doesn't come back square.
export function pickImageSize(
  width?: number,
  height?: number,
): '1024x1024' | '1536x1024' | '1024x1536' {
  if (!width || !height || width <= 0 || height <= 0) return '1024x1024';
  const ratio = width / height;
  if (ratio > 1.2) return '1536x1024';
  if (ratio < 0.83) return '1024x1536';
  return '1024x1024';
}

// Stable, salted hash used for per-IP rate limiting. The salt prevents
// rainbow-table reversal; raw IPs are never written to the database.
// Edge runtime: avoid Node `crypto`; use Web Crypto if available.
export async function hashIp(ip: string): Promise<string> {
  const pepper = process.env.RATE_LIMIT_PEPPER ?? 'sceneva-default-pepper';
  const data = new TextEncoder().encode(`${pepper}:${ip}`);
  // @ts-ignore — globalThis.crypto exists in both Node 20+ and edge
  const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? '0.0.0.0';
}
