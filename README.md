# Sceneva — Production app

AI room visualizer widget for online rug retailers. Built for 6-day launch (24 Haz → 30 Haz 2026).

## Stack

- **Next.js 14** (App Router) on Vercel
- **Supabase** — Postgres + auth + storage
- **OpenAI gpt-image** — room composition (rug placement)
- **Lemon Squeezy** — billing (merchant of record, no tax headaches)
- **Resend** — transactional emails
- **Tailwind CSS** — styling
- **Vanilla TS bundle** — widget script (`/widget/widget.js`)

## Repo layout

```
app/
  (auth)/login, signup, forgot-password   — auth UI
  onboarding/                              — 3-step wizard
  overview/, settings/, billing/           — dashboard pages
  api/
    widget/[key]/                          — GET config (CORS open, edge cached)
    visualize/                             — POST AI generation
    event/                                 — POST usage tracking
    checkout/                              — POST Lemon checkout
    lemon/webhook/                         — POST Lemon lifecycle events
    billing/portal/                        — POST customer portal URL
    contact/                               — POST contact form → Resend
  docs/[slug]/                             — markdown-driven help docs
  privacy/, terms/, contact/               — legal + support
components/DashShell.tsx                   — sidebar + topbar layout
lib/
  supabase-server.ts, supabase-browser.ts  — SSR + client Supabase
  openai.ts                                — gpt-image edit helper
  lemon.ts                                 — checkout + webhook signature verify
  types.ts                                 — shared TypeScript types
widget/src/
  index.ts                                 — entry, mounts the floating button
  detector.ts                              — product image detection
  modal.ts                                 — upload/generating/result UI
  api.ts                                   — fetch helpers
emails/                                    — React Email templates
content/docs/                              — markdown source for /docs
supabase/schema.sql                        — DB schema (run once on Supabase)
public/                                    — favicon + widget bundle output
```

---

## ⚡ Day 1 — what to do tomorrow (Pazartesi 24 Haz)

### 1. Buy services + share keys (do this first, ~30 min)

- **Domain**: buy `sceneva.com` (or alt) on Namecheap. Set DNS to Vercel (instructions on Vercel after creating project).
- **GitHub**: create empty repo `sceneva-app`. Push this folder.
- **Vercel**: import the repo. Don't add env vars yet.
- **Supabase**: create new project. Region: closest to your users (eu-central-1 if EU). Note the URL + anon key + service role key.
- **OpenAI**: create API key, ensure `gpt-image-1` access enabled (Org settings → Models).
- **Lemon Squeezy**: create account → create Store "Sceneva" → create Product "Sceneva Growth" → variant $99/mo recurring. Note: API key, Store ID, Variant ID, Webhook signing secret.
- **Resend**: create account → add `sceneva.com` domain → add DNS records → wait for verification (5-30 min).

### 2. Drop schema into Supabase

In Supabase dashboard → SQL Editor → paste `supabase/schema.sql` → Run. Confirm tables created.

In Supabase Storage → Create 2 buckets:
- `rooms` (private) — for uploaded room photos
- `previews` (public) — for generated previews

### 3. Configure Resend in Supabase Auth

Supabase → Authentication → Email templates → Use SMTP → Resend.
Or use Supabase's default email service for Day 1 if Resend domain isn't verified yet.

### 4. Fill `.env.local`

```bash
cp .env.example .env.local
# Then fill in every value from step 1.
```

### 5. Install + run

```bash
pnpm install
pnpm widget:build    # builds widget/src/index.ts → public/widget/widget.js
pnpm dev
```

Open http://localhost:3000 — should redirect to `/login`. Sign up → onboarding → dashboard.

### 6. Day 1 critical test — AI quality

Before going further, test the AI:

1. Sign up + onboard locally
2. On your localhost or staging Shopify, paste the widget snippet
3. Upload 5-10 test room photos × 2 rug images
4. Manually inspect: does the rug land in the right spot? Right colors? Right scale?

**If quality is < 60% pass**: pivot to Replicate's `flux-kontext` model. Swap the `visualizeRoomWithRug` function in `lib/openai.ts`. Don't burn Day 2 on this — decide Day 1 evening.

---

## Day-by-day checklist

### Day 1 (Mon)
- [ ] All accounts created
- [ ] Domain → Vercel
- [ ] Supabase schema deployed
- [ ] `.env.local` filled, app boots locally
- [ ] AI quality test passes (or pivoted)

### Day 2 (Tue)
- [ ] Push to GitHub, deploy to Vercel
- [ ] Vercel env vars set
- [ ] Custom domain wired (app.sceneva.com)
- [ ] Test full signup → onboarding → dashboard flow on prod
- [ ] Resend domain verified, welcome email working

### Day 3 (Wed) — Widget engine day
- [ ] Test Shopify store created (3-day free trial)
- [ ] Real widget script deployed to `app.sceneva.com/widget/widget.js`
- [ ] Embed on Shopify → product detection works → visualize → result
- [ ] End-to-end latency < 25s
- [ ] Usage events logged to Supabase

### Day 4 (Thu) — Billing day
- [ ] Lemon Squeezy webhook URL set (`https://app.sceneva.com/api/lemon/webhook`)
- [ ] Test card subscribes successfully (Test Mode)
- [ ] Subscription row created in DB
- [ ] Dashboard usage updates after generations
- [ ] Limit enforcement returns 402 when reached

### Day 5 (Fri) — Polish day
- [ ] Termly ToS + Privacy embedded (replace placeholders in `app/privacy/page.tsx`, `app/terms/page.tsx`)
- [ ] Real user test with 1 rug-store merchant (30 min Zoom)
- [ ] Welcome/usage warning emails firing
- [ ] All 5 docs reviewed
- [ ] Sentry wired (NEXT_PUBLIC_SENTRY_DSN)
- [ ] Plausible analytics added

### Day 6 (Sat) — Launch day
- [ ] Lemon Live Mode keys deployed
- [ ] QA checklist (see below) passes
- [ ] Test transaction with real card → refund
- [ ] Soft launch: Twitter / IH / DM 20 merchants

---

## QA checklist (Day 6 morning)

**Auth**
- [ ] Sign up with new email works
- [ ] Confirmation email arrives + click confirms
- [ ] Login works
- [ ] Forgot password works
- [ ] Logout works

**Onboarding**
- [ ] Redirected to /onboarding after signup
- [ ] All 3 steps save correctly
- [ ] Embed code visible at step 3, Copy works
- [ ] Redirects to /overview on finish

**Billing**
- [ ] Lemon Squeezy Checkout opens from `/billing`
- [ ] Test payment succeeds → webhook fires → status `active`
- [ ] Usage card on Overview reflects subscription
- [ ] Customer Portal opens from `/billing → Manage`

**Widget on real Shopify**
- [ ] Floating button appears with correct accent color + label
- [ ] Click → modal opens, brand-correct
- [ ] Upload photo → loading → generated result
- [ ] Download button works (file downloads)
- [ ] Share button uses Web Share API if available
- [ ] Start over resets state

**Dashboard**
- [ ] Overview KPIs reflect real events
- [ ] Top products + pages aggregate correctly
- [ ] Settings: change accent → widget updates within 2 min
- [ ] Regenerate embed key → old key fails, new works

**Edge cases**
- [ ] Limit reached → 402 + friendly upgrade modal
- [ ] Invalid embed key → 404
- [ ] AI failure → friendly error in modal
- [ ] Dark theme site has decent contrast on widget

**Legal + Support**
- [ ] Privacy page loads (Termly embedded)
- [ ] Terms page loads (Termly embedded)
- [ ] Contact form → email arrives at hello@sceneva.com

---

## Architecture notes

### Why we picked these tools

- **Lemon Squeezy over Stripe** — no business verification delay, handles EU VAT + US sales tax as Merchant of Record. Higher fee (5% vs 2.9%) is worth the launch speed.
- **OpenAI gpt-image over Replicate** — user already has API access, reliable. Fallback: swap `lib/openai.ts` to Replicate Flux Kontext if quality insufficient.
- **Supabase over building auth** — saves 2+ days. Bonus: storage and Postgres in same dashboard.
- **Resend over SendGrid** — better DX, generous free tier (3,000 emails/mo), founder-friendly.
- **Vanilla TS widget** — no React on shopper sites; tiny bundle (<15KB gzipped), zero conflicts with merchant's site.

### Usage limit enforcement

Two layers:

1. **Soft limit** (UI): dashboard shows usage progress, warning email at 80%.
2. **Hard limit** (API): `/api/visualize` returns `402 limit_reached` if `current_period_usage().used >= limit_total`. Widget shows friendly upgrade modal.

Atomic counter via Postgres function `increment_usage()` — safe under concurrent load.

### CORS

- `/api/widget/*` and `/api/visualize` and `/api/event` set `Access-Control-Allow-Origin: *` so they work from any merchant domain.
- Widget script bundle has cache headers (5 min) — quick to update settings without full redeploy.

### Widget caching strategy

- Config (`/api/widget/:key`) — edge cached 2 min, so accent color changes propagate fast but DB doesn't get hit on every page load.
- Widget JS — edge cached 5 min, immutable per deploy.

---

## What's NOT in v1.0 (planned for v1.1+)

- Multi-widget per account
- Inline Button + Side Tab formats (only Floating in v1.0)
- Multi-language widget copy (English only in v1.0)
- Detailed Analytics page (Overview is enough)
- Product Detection deep-test tool (we test offline for merchants)
- Webhook → Slack notifications
- Custom CSS selectors UI (we add per-customer manually for v1.0)
- Annual billing (monthly only in v1.0)
- Team accounts (single user in v1.0)

---

## Support

- hello@sceneva.com
- Status: status.sceneva.com (planned)
- Docs: app.sceneva.com/docs/install-shopify

---

Built with care. Ship fast. 🚀
