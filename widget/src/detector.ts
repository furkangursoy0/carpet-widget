// ═══════════════════════════════════════════════════════════════════
// Product image detector
//
// Detection order:
//   1) Merchant-configured custom CSS selector (Settings → Advanced)
//   2) `data-sceneva-product-image` on the host page (explicit opt-in)
//   3) Common gallery selectors across Shopify / WooCommerce / Wix /
//      Squarespace / BigCommerce / generic e-commerce themes
//   4) <meta property="og:image">
//   5) <script type="application/ld+json"> with a Product entity
//   6) Largest visible image on the page (>500 px) — last-ditch fallback
//   7) `none` — widget asks the shopper to upload the rug too
// ═══════════════════════════════════════════════════════════════════

export type DetectionMethod =
  | 'custom'
  | 'data-attr'
  | 'gallery'
  | 'og'
  | 'json-ld'
  | 'largest'
  | 'none';

export type DetectedProduct = {
  imageUrl: string;
  title: string;
  method: DetectionMethod;
};

// Curated cross-platform selectors. Order matters — earlier wins.
const GALLERY_SELECTORS = [
  // Shopify
  '.product__media img',
  '.product__media-item img',
  '.product-single__media img',
  '.product__photo img',
  '.product-gallery img',
  // WooCommerce
  '.woocommerce-product-gallery__image img',
  '.flex-viewport img',
  '.wp-post-image',
  // BigCommerce
  '[data-image-gallery] img',
  '.productView-image img',
  // Wix / Squarespace / generic
  '[data-image-id] img',
  '.product-image img',
  '.product-image-main img',
  '[data-product-image] img',
  '[itemprop="image"]',
];

export function detectProductImage(customSelector: string | null = null): DetectedProduct {
  // 1) Merchant's custom selector (highest trust)
  if (customSelector) {
    const img = safeQuery<HTMLImageElement>(customSelector);
    const src = imgSrc(img);
    if (src) return { imageUrl: absoluteUrl(src), title: getTitle(), method: 'custom' };
  }

  // 2) Explicit opt-in attribute
  const optIn = document.querySelector<HTMLElement>('[data-sceneva-product-image]');
  if (optIn) {
    const src =
      optIn.tagName === 'IMG'
        ? imgSrc(optIn as HTMLImageElement)
        : optIn.getAttribute('data-sceneva-product-image') ||
          imgSrc(optIn.querySelector<HTMLImageElement>('img'));
    if (src) return { imageUrl: absoluteUrl(src), title: getTitle(), method: 'data-attr' };
  }

  // 3) Curated gallery selectors
  for (const sel of GALLERY_SELECTORS) {
    const img = safeQuery<HTMLImageElement>(sel);
    const src = imgSrc(img);
    if (src && isImageBigEnough(img!)) {
      return { imageUrl: absoluteUrl(src), title: getTitle(), method: 'gallery' };
    }
  }

  // 4) Open Graph image
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (og?.content) {
    return { imageUrl: absoluteUrl(og.content), title: getTitle(), method: 'og' };
  }

  // 5) JSON-LD product schema
  const lds = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
  for (const node of lds) {
    try {
      const data = JSON.parse(node.textContent || '');
      const image = pickProductImageFromLd(data);
      if (image) return { imageUrl: absoluteUrl(image), title: getTitle(), method: 'json-ld' };
    } catch {
      // ignore parse errors
    }
  }

  // 6) Largest visible image as fallback
  const all = Array.from(document.querySelectorAll<HTMLImageElement>('img'))
    .filter((img) => (img.naturalWidth || img.offsetWidth) > 500)
    .filter((img) => (img.naturalHeight || img.offsetHeight) > 500)
    .filter((img) => img.offsetWidth > 0 && img.offsetHeight > 0)
    .sort((a, b) => area(b) - area(a));
  if (all[0]) {
    return { imageUrl: absoluteUrl(all[0].src || all[0].currentSrc), title: getTitle(), method: 'largest' };
  }

  return { imageUrl: '', title: getTitle(), method: 'none' };
}

function pickProductImageFromLd(data: any): string | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const d of data) {
      const r = pickProductImageFromLd(d);
      if (r) return r;
    }
    return null;
  }
  const t = data['@type'];
  const isProduct = t === 'Product' || (Array.isArray(t) && t.includes('Product'));
  if (isProduct) {
    const img = data.image;
    if (typeof img === 'string') return img;
    if (Array.isArray(img)) {
      const first = img[0];
      if (typeof first === 'string') return first;
      if (first?.url) return first.url;
      if (first?.contentUrl) return first.contentUrl;
    }
    if (img?.url) return img.url;
    if (img?.contentUrl) return img.contentUrl;
  }
  if (data['@graph']) return pickProductImageFromLd(data['@graph']);
  return null;
}

function safeQuery<T extends Element>(sel: string): T | null {
  try {
    return document.querySelector<T>(sel);
  } catch {
    return null;
  }
}

function imgSrc(img: HTMLImageElement | null): string | null {
  if (!img) return null;
  return img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-srcset')?.split(' ')[0] || null;
}

function isImageBigEnough(img: HTMLImageElement): boolean {
  const w = img.naturalWidth || img.offsetWidth || 0;
  return w > 240;
}

function area(img: HTMLImageElement): number {
  const w = img.naturalWidth || img.offsetWidth;
  const h = img.naturalHeight || img.offsetHeight;
  return w * h;
}

function absoluteUrl(src: string): string {
  try {
    return new URL(src, location.href).toString();
  } catch {
    return src;
  }
}

function getTitle(): string {
  // Most-specific product selectors first; fall back to og:title, then
  // JSON-LD Product.name, then a generic h1, then <title>. This order
  // matters: many storefronts use a brand h1 in the site header, so
  // a naive `h1` lookup would return the brand instead of the product.
  const productH1 = document.querySelector(
    'h1.product-title, h1.product__title, h1.product_title, h1[itemprop="name"], .product-name h1, .product_title',
  );
  if (productH1?.textContent?.trim()) return productH1.textContent.trim();

  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (og?.content?.trim()) return og.content.trim();

  for (const node of Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))) {
    try {
      const data = JSON.parse(node.textContent || '');
      const name = pickProductNameFromLd(data);
      if (name) return name;
    } catch {
      /* ignore */
    }
  }

  const h1 = document.querySelector('h1')?.textContent?.trim();
  if (h1) return h1;

  return (document.title || 'this product').trim();
}

function pickProductNameFromLd(data: any): string | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const d of data) {
      const r = pickProductNameFromLd(d);
      if (r) return r;
    }
    return null;
  }
  const t = data['@type'];
  const isProduct = t === 'Product' || (Array.isArray(t) && t.includes('Product'));
  if (isProduct && typeof data.name === 'string') return data.name.trim();
  if (data['@graph']) return pickProductNameFromLd(data['@graph']);
  return null;
}
