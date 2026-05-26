---
title: Install Sceneva on a custom site
order: 3
---

# Install Sceneva on a custom site

For headless commerce, custom-built stores, or platforms we don't document yet (Wix, Squarespace, BigCommerce, Magento, etc.).

## 1. Authorize your domain

**Settings → Authorized domains** — add every hostname the widget should run on. Subdomains and `www.` variants are matched automatically; staging hosts (e.g. `staging.example.com`) need to be added explicitly.

## 2. Drop the snippet anywhere before `</body>`

```html
<script async src="https://app.sceneva.com/widget/widget.js" data-sceneva-key="YOUR_KEY"></script>
```

That's it for the script. The widget boots, fetches its config, and mounts a floating button on every page where the snippet loads.

## 3. (Optional) Tell us exactly which image to use

The detector tries a few strategies — curated gallery selectors, then `og:image`, then JSON-LD `Product` schema, then the largest visible image. If your markup is unusual, the cleanest fix is to mark your hero image explicitly:

```html
<img src="/products/rug.jpg" data-sceneva-product-image alt="Moroccan Oatmeal Rug">
```

The `data-sceneva-product-image` attribute always wins over the auto-detector. No dashboard configuration needed.

Alternatively, pin a CSS selector in **Settings → Advanced**:

```
.my-theme-product-photo img
```

## 4. Single-page apps (Next.js, Nuxt, Remix, Hydrogen)

The widget hooks into `history.pushState` / `replaceState` and re-detects the product on every client-side route change. You don't need to remount or reinitialize it — load the script once in your root layout and you're done.

## 5. CSP-strict sites

If your site enforces a Content Security Policy, allow:

- `script-src https://app.sceneva.com`
- `connect-src https://app.sceneva.com`
- `img-src https://*.supabase.co` (the generated preview comes from your Supabase project's storage CDN)

Email **hello@sceneva.com** if you're integrating with something not covered here — we'll write a guide for your platform.
