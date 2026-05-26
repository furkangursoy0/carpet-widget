---
title: Customize your widget
order: 4
---

# Customize your widget

Open **Settings** in your dashboard. Every change goes live within ~5 minutes (we cache the widget config at the edge for speed).

## Status

A simple toggle. **Active** = floating button shown to every shopper. **Paused** = the embed snippet stays on your store but no widget renders, no API calls happen, no quota is consumed. Useful for turning the widget off during a sale or while you investigate a theme issue.

## Accent color

Six preset swatches. Used for the floating button background, the modal's primary CTA, and the "Preview ready" badge.

## Button label

The text shoppers see on the product page (max 40 characters). Default: *See this rug in your room.*

## Border radius

How rounded the floating button is. 0 = sharp corners, 32 = fully rounded pill.

## Widget format

Two layouts, both single-snippet installs:

- **Floating button** — pill button pinned to the bottom corner you choose. Standard choice for almost every store.
- **Side tab** — vertical tab anchored to a viewport edge (left or right). Pick this when your bottom-right is already occupied by a chat widget (Intercom, Tawk, Crisp) so the two don't fight for the same real estate.

## Position

- For **floating button**: bottom-right or bottom-left.
- For **side tab**: right edge or left edge.

On mobile (≤ 640 px) the floating button automatically lifts above the typical sticky cart bar position.

## Button shape (floating only)

Choose between **Pill** (icon + text label) and **Circle** (icon only). Pill is the default. Use Circle when the bottom corner of your store is crowded — many merchants run a chat widget there and want Sceneva to take up the smallest possible footprint.

## Authorized domains

The hostnames your widget is allowed to run on. **The widget refuses to call the API from any domain not in this list** — this is what stops anyone from stealing your embed key and using it to burn through your monthly quota. Add staging hosts and subdomains here too.

## Embed code

Copy the snippet and paste it before `</body>` in your store theme. Click **Regenerate key** to rotate your widget key — the old snippet stops working immediately (use it after a contractor handoff or if you suspect the key has leaked).

## Advanced — Custom product image selector

If our auto-detector picks the wrong image on your theme, pin a CSS selector here. It's tried before all built-in selectors. Example:

```
.my-theme .product-hero img
```
