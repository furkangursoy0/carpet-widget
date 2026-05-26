---
title: Privacy & data handling
order: 6
---

# Privacy & data handling

We're a B2B SaaS sitting in front of your shoppers, so we hold ourselves to a strict "collect the minimum we need" rule.

## What we collect from shoppers

When a shopper opens the widget on your store, we receive:

- The room photo they uploaded
- The product image URL from your page (publicly accessible)
- The product title
- The sanitized page URL (origin + pathname only — query strings are stripped to avoid capturing UTM tags or session tokens)
- The device class (desktop / mobile / tablet) parsed from the User-Agent
- A salted SHA-256 hash of their IP address (used only for rate limiting; raw IP is never written to the database)

**We do not store:** raw IP addresses, raw User-Agent strings, referrer URLs, or anything that would let us re-identify an individual shopper across visits.

## What happens to the room photo

The uploaded room photo is sent to OpenAI's image-edit API as part of the request, then discarded. It's not written to our database or storage buckets. It's gone from our infrastructure the moment the response comes back.

## What happens to the generated preview

The AI-composed result is stored in a **private** Supabase bucket. The shopper sees it via a signed URL that expires after **30 days**. The merchant can see thumbnails in the Overview dashboard. After 30 days the signed URL stops working; the underlying file remains available to re-mint URLs from the dashboard.

## What the merchant can see

In the dashboard, you see:

- Aggregate counts (previews generated, downloads, shares, errors)
- Top products and top pages
- Device split (desktop / mobile / tablet)
- A recent-activity feed with event type, product, device, and timestamp

You **never** see the shopper's room photo. You **never** see a shopper's IP or User-Agent.

## Third parties

- **OpenAI** — for the actual image composition (the shopper's room photo + your product image are sent here).
- **Supabase** — our hosting + database + storage provider.
- **Resend** — only for sending you transactional emails (e.g. monthly limit reached).
- **Lemon Squeezy** — only for billing; shoppers never interact with it.

If you need a DPA or a more formal write-up for your own privacy policy, email **hello@sceneva.com**.
