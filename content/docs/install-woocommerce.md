---
title: Install Sceneva on WooCommerce
order: 2
---

# Install Sceneva on WooCommerce

## 1. Authorize your domain

**Settings → Authorized domains** — confirm your store hostname is listed. The widget will only run on domains in this list.

## 2. Copy your embed code

**Settings → Embed code → Copy**.

## 3. Inject the snippet

WooCommerce themes vary, so use whatever your theme already supports for footer scripts:

- **Insert Headers and Footers** plugin → paste in the **Footer scripts** box.
- **Astra / Kadence / Avada / GeneratePress** users: most themes have a built-in "Footer scripts" field under **Theme Options** or **Customize → Additional Code**.
- **Block themes (FSE)**: edit your footer template part and add a Custom HTML block containing the snippet.

## 4. Save and preview

Open any product page. The Sceneva button appears within seconds.

## Common WooCommerce gotchas

**Detection picks the brand banner instead of the product.**
Some themes set `og:image` to a logo. Either fix the SEO setting or pin a custom selector in **Settings → Advanced**. Good starting selectors for WC themes:

- `.woocommerce-product-gallery__image img`
- `.flex-viewport img`
- `img.wp-post-image`

**The widget loads but immediately disappears.**
Check that the snippet isn't being filtered out by a security plugin (Wordfence, Sucuri). Add `app.sceneva.com` to the script-source allow-list.

Email **hello@sceneva.com** with your product URL if detection fails on your theme — we'll send back a one-line selector you can paste into Settings.
