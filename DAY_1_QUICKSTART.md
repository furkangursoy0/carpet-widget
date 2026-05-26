# 🚀 Day 1 — Quickstart (yarın bunu açıp yap)

Hedef gün sonu: lokalde signup → onboarding → dashboard akışı çalışıyor + AI quality testi geçmiş.

## 1) Hesapları aç (paralel yap, 30dk)

Sırayla bunlara kaydol:

| Servis | Link | Ne lazım |
|---|---|---|
| Domain | namecheap.com | sceneva.com (12$) — DNS Vercel'e |
| GitHub | github.com | repo: `sceneva-app` |
| Vercel | vercel.com | GitHub ile login, repo import |
| Supabase | supabase.com | new project, region eu-central-1 |
| OpenAI | platform.openai.com | API key, gpt-image-1 access ✓ |
| Lemon Squeezy | lemonsqueezy.com | Store + Product variant $99/mo |
| Resend | resend.com | API key, sceneva.com domain verify |

## 2) Repo + Vercel

```bash
cd /Users/furkan/Documents/sceneva-app
git init && git add . && git commit -m "Initial scaffolding"
gh repo create sceneva-app --private --source=. --remote=origin --push
```

Vercel'de import. Domain bağla: `app.sceneva.com` → app subdomain, `cdn.sceneva.com` → alias.

## 3) Supabase schema

Supabase dashboard → **SQL Editor** → `supabase/schema.sql` içeriğini paste + Run.

**Storage** → 2 bucket oluştur:
- `rooms` (private)
- `previews` (public)

## 4) `.env.local` doldur

```bash
cp .env.example .env.local
# Editle, tüm key'leri yapıştır.
```

## 5) Çalıştır

```bash
pnpm install
pnpm widget:build
pnpm dev
```

http://localhost:3000 → /login → signup → onboarding → /overview.

## 6) AI kalite testi (KRİTİK — gün sonu)

**Pass:** 10 test image → 6+ tanesi kabul edilebilir → devam.
**Fail:** lib/openai.ts'i Replicate flux-kontext'e çevir.

## 7) Push to production

```bash
git add . && git commit -m "Day 1 done" && git push
```

Vercel'de env vars ekle (Settings → Environment Variables → tüm `.env.local` değerlerini paste).

Custom domain test:
- `app.sceneva.com/login` → açılıyor mu
- `app.sceneva.com/widget/widget.js` → JS dosyası servis ediliyor mu

## 8) Lemon webhook URL'i set

Lemon dashboard → Settings → Webhooks → `https://app.sceneva.com/api/lemon/webhook`
Events: subscription_created, _updated, _cancelled, _payment_success, _payment_failed

---

Bittiğinde Day 2'ye geçebiliriz. README.md tüm sonraki günleri içeriyor.
