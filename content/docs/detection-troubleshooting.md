---
title: Product detection troubleshooting
order: 5
---

# Product detection troubleshooting

When a shopper opens the widget, Sceneva finds the product image on your page automatically. Here's the order it tries — earlier matches always win:

1. **Custom selector** — anything you pinned in **Settings → Advanced**
2. **`data-sceneva-product-image`** — explicit opt-in attribute on a `<img>` or wrapper
3. **Curated gallery selectors** — Shopify, WooCommerce, BigCommerce, Wix, Squarespace conventions
4. **Open Graph image** — `<meta property="og:image">`
5. **JSON-LD product schema** — `<script type="application/ld+json">` containing a `Product` entity (we resolve `image`, `ImageObject.url`, and `ImageObject.contentUrl`)
6. **Largest visible image** — last-ditch fallback, requires >500 × 500 px and currently visible
7. **None** — widget proceeds anyway; the shopper just sees the product info from your page title

If detection lands on the wrong image, the cleanest fix is to add `data-sceneva-product-image` directly to your hero image, or pin a custom selector in **Settings → Advanced**.

## Common issues

**My rug appears blurry in the preview.**
The detected image is low-resolution. Add a high-resolution gallery image (1200 × 1200+) and the preview improves immediately.

**A logo or banner appears as the rug.**
Your theme's `og:image` is set to a brand asset instead of the product image. Either update your SEO/sharing image, or pin a selector in **Settings → Advanced** that targets the actual product photo.

**Detection works on the first product but not when I navigate between products on a single-page app.**
This should already work — the widget re-detects on every `history.pushState` / `popstate` event. If you're seeing stale products, the most common cause is that the new product's image is lazy-loading; try waiting a beat and reopening the widget. Report the URL to **hello@sceneva.com** if it persists.

**My theme caches aggressively and changes don't show.**
Settings updates take up to 5 minutes to propagate (we cache the widget config at the edge for performance). Hard-refresh (`Cmd/Ctrl+Shift+R`) to verify.
