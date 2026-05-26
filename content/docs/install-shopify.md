---
title: Install Sceneva on Shopify
order: 1
---

# Install Sceneva on Shopify

Live in under 3 minutes.

## 1. Authorize your store domain

Open **Settings → Authorized domains** and confirm your store's hostname is listed (e.g. `nomadrugs.com`). We pre-fill this from the URL you gave during onboarding, but double-check it — the widget refuses to run on any domain not in this list. That's what stops anyone from copying your embed key onto a different site and burning through your quota.

Need to test from a `myshopify.com` preview URL? Add `your-store.myshopify.com` to the list too.

## 2. Copy your embed code

**Settings → Embed code → Copy**.

```html
<script async src="https://app.sceneva.com/widget/widget.js" data-sceneva-key="..."></script>
```

## 3. Open your theme editor

In Shopify admin: **Online Store → Themes → Actions → Edit code**.

## 4. Paste into `theme.liquid`

Open `layout/theme.liquid` and find the closing `</body>` tag (near the bottom). Paste the snippet **directly above** it.

## 5. Save and preview

Click **Save**. Open any product page on your store — the floating "See this rug in your room" button appears in the bottom-right corner within a few seconds.

## 6. Test the full flow

Click the button → upload a room photo → wait ~10 seconds → see the rug placed in your room.

## Troubleshooting

**The button doesn't appear.**
- Check that Status is **Active** in Settings.
- Confirm your store's hostname is in **Authorized domains**.
- Hard-refresh (`Cmd/Ctrl+Shift+R`) to bypass theme cache.
- Look for `[Sceneva]` warnings in the DevTools console.

**The wrong image is being used as the rug.**
- We auto-detect via `.product__media img`, then `og:image`, then JSON-LD. Most Shopify themes work out of the box.
- For a custom or heavily-modified theme: **Settings → Advanced → Custom product image selector**. Paste a CSS selector that points to your product hero image (e.g. `.my-product-photo img`).

**I'm on Hydrogen (Shopify's React stack).**
The widget detects SPA route changes automatically and re-runs detection on each product page — no extra config needed.

Still stuck? Email **hello@sceneva.com** and we'll get you live within a few hours.
