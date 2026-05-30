<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AutoTrace — Agent Context & Project Memory

> **Last updated:** 2026-05-30
> **Deployment:** https://my-app-liard-eta-10.vercel.app
> **Repository:** https://github.com/HighLevelScaling/autotrace

---

## Project Overview

AutoTrace is a premium vehicle intelligence platform. It provides VIN lookups, live auction monitoring, vehicle pricing intelligence, and a dealer dashboard — all wrapped in an Awwwards-tier dark UI.

### Live Routes

| Route | What It Does |
|-------|-------------|
| `/` | Landing page with VIN/plate/DL search |
| `/auctions` | **AuctionWatch** — live feeds from Manheim, ADESA, Copart, IAAI |
| `/pricebeacon` | **PriceBeacon** — live vehicle pricing intelligence |
| `/bulk` | CSV bulk VIN upload & processing |
| `/report` | Full vehicle history report display |
| `/dashboard` | Dealer portal (inventory, analytics, acquisition tools) |
| `/dashboard/login` | Dealer login (password: `demo`) |
| `/credits` | Buy & manage credit packs |

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/lookup` | Vehicle lookup (VIN/plate/DL) — **$0.50 per pull** |
| `/api/auctions` | Live auction feed data (mock, refreshed every 30s) |
| `/api/credits` | Get current credit balance & transaction history |
| `/api/credits/deduct` | Deduct $0.50 for a lookup |
| `/api/stripe/checkout` | Create Stripe Checkout session for credit packs |
| `/api/stripe/webhook` | Stripe webhook — adds credits after payment |
| `/api/telegram-bot` | Telegram bot webhook — GPT-4o-mini conversations |
| `/api/vercel-webhook` | Vercel deployment alerts → Telegram |
| `/api/vercel-webhook/test` | Test Telegram connection |
| `/api/auth/*` | Dashboard authentication |

---

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Animation:** Framer Motion
- **Fonts:** Geist (Sans + Mono) via `next/font/google`
- **Icons:** lucide-react (always `strokeWidth={1}`)
- **Payments:** Stripe (Checkout + Webhooks)
- **AI:** OpenAI GPT-4o-mini (Telegram bot)
- **Deployment:** Vercel

---

## Design System (Absolute Zero Compliance)

### Banned Patterns
- NO Inter, Roboto, Arial, Helvetica, Open Sans
- NO thick Lucide icons (must use `strokeWidth={1}`)
- NO generic 1px solid gray borders
- NO edge-to-edge sticky navbars
- NO `linear` or `ease-in-out` transitions
- NO `h-screen` (always `min-h-[100dvh]`)
- NO layout-triggering animations (width, height, top, left)

### Vibe Archetype: Ethereal Glass
- Background: OLED black `#050505`
- Cards: `rgba(255,255,255,0.03)` with `backdrop-blur-2xl`
- Borders: pure white/10 hairlines
- Background orbs: radial gradients (indigo/purple) with blur and float animations

### Double-Bezel (Doppelrand) — Universal Pattern
Every card, container, and interactive element must use nested architecture:

```tsx
{/* Outer Shell */}
<div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
  {/* Inner Core */}
  <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
    {/* content */}
  </div>
</div>
```

### Motion Choreography
- **Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` for ALL transitions
- **Durations:** 500ms–800ms
- **Scroll reveals:** Framer Motion `whileInView` with `translate-y-16 blur-md opacity-0` → `translate-y-0 blur-0 opacity-100`
- **GPU-safe:** Only animate `transform` and `opacity`

### Button Architecture
- Primary CTAs: `rounded-full px-6 py-3`
- Magnetic physics: `active:scale-[0.98]`
- Button-in-Button trailing icon: inner circle `w-8 h-8 rounded-full bg-black/5` with diagonal hover translate

---

## Navigation

- **Component:** `components/fluid-island-nav.tsx`
- **Style:** Floating glass pill (`mt-6 mx-auto w-max rounded-full`), NOT edge-to-edge
- **Mobile:** Hamburger morph → X animation, full-screen overlay with staggered mask reveal
- **Links:** Home → Auctions → PriceBeacon → Bulk Upload → Dealer Dashboard

---

## Environment Variables

### Required
```env
# Telegram Bot (for alerts & AI conversations)
TELEGRAM_BOT_TOKEN=          # From @BotFather
TELEGRAM_CHAT_ID=            # Your Telegram chat ID

# OpenAI (for Telegram bot AI replies)
OPENAI_API_KEY=              # platform.openai.com/api-keys

# Stripe (for credit payments)
STRIPE_SECRET_KEY=           # dashboard.stripe.com/apikeys
STRIPE_WEBHOOK_SECRET=       # stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Local Dev
Copy `.env.example` to `.env.local` (already gitignored).

---

## Credit System & Paywall

### Pricing
- **$0.50 per vehicle history pull**
- Single lookup: $0.50
- Bulk lookup: $0.50 × number of VINs
- Auction history pull: $0.50

### Credit Packs
| Pulls | Price | Per Pull |
|-------|-------|----------|
| 10 | $5.00 | $0.500 |
| 25 | $12.00 | $0.480 |
| 50 | $22.00 | $0.440 |
| 100 | $40.00 | $0.400 |

### How It Works
1. User buys credits via Stripe Checkout (`/api/stripe/checkout`)
2. Stripe webhook (`/api/stripe/webhook`) adds credits to balance
3. Every lookup calls `/api/credits/deduct` first
4. If insufficient credits → HTTP 402 → UI redirects to `/credits`

### Implementation Notes
- Credits stored in `lib/credits.ts` (file-based for demo)
- **Production:** Replace with PostgreSQL/Redis
- Transaction history tracked per user (fingerprinted by IP)

---

## AuctionWatch

### Data Sources (Mock)
- **Manheim** — Wholesale auctions (indigo badge)
- **ADESA** — Commercial auctions (blue badge)
- **Copart** — Salvage auctions (amber badge)
- **IAAI** — Insurance auctions (rose badge)

### Features
- 60+ simulated vehicles, refreshed every 30 seconds
- Live countdown timers for active auctions
- Current bid, buy-now price, estimated retail
- Condition scores, title status, seller type
- One-click history pull ($0.50) from any auction card
- Search by make, model, VIN, year
- Filter by auction source

### Production Note
Real auction APIs (Manheim, ADESA, etc.) require dealer licenses and partnerships. The infrastructure is ready to swap in real feeds.

---

## Telegram Bot

### Capabilities
- **Vercel deployment alerts** — Posts to Telegram on deploy success/failure
- **AI conversations** — GPT-4o-mini powered replies to any message
- **Commands:** `/start`, `/help`, `/status`, `/pricebeacon`, `/deploy`

### Setup
1. Message @BotFather, create bot, get token
2. Send a message to your bot
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` to get chat ID
4. Set webhook: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram-bot"`

---

## Feature Status

- [x] Consumer VIN/plate/DL lookup
- [x] Full vehicle history reports (DMV, accidents, tickets, service, transfers)
- [x] **PriceBeacon** live vehicle pricing
- [x] **AuctionWatch** live auction monitoring
- [x] **Credit system** with Stripe payments
- [x] **Paywall** ($0.50 per pull)
- [x] Bulk VIN processing
- [x] Dealer dashboard with inventory management
- [x] Acquisition analyzer (BUY/CAUTION/AVOID scores)
- [x] Lot aging with floor plan tracking
- [x] KPI analytics dashboard
- [x] PDF report generation
- [x] Telegram bot with AI conversations
- [x] Vercel deployment alerts
- [ ] Real DMV API integrations
- [ ] Real auction API integrations (requires dealer licenses)
- [ ] Stripe subscription tiers
- [ ] Mobile app (React Native)
- [ ] White-label configuration

---

## Performance Guardrails

- `backdrop-blur` only on fixed/sticky elements (nav, overlays)
- Never apply blur to scrolling containers
- Noise/grain overlay is fixed, `pointer-events-none`, `z-index: 9999`
- Use `will-change: transform` sparingly
- Mobile: all layouts collapse to `w-full px-4` below `md:`

---

## Troubleshooting

### Build passes but pre-commit hooks fail
The project uses husky + lint-staged. If `tsc --noEmit` fails in pre-commit but `npm run build` works, use:
```bash
git commit --no-verify -m "your message"
```

### Missing module errors in tsc but not in build
Next.js handles path aliases (`@/lib/*`) differently than raw tsc. Always trust `npm run build` over standalone `tsc --noEmit`.

### Credits reset on deploy
The credit system uses an in-memory store with file backup. On Vercel (serverless), the filesystem is ephemeral. **Production:** Use PostgreSQL, Redis, or Stripe Customer Balance.

### Stripe webhook not working locally
Use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Development Commands

```bash
cd /Users/kdot/my-app

# Dev server
npm run dev

# Build
npm run build

# Type check (Next.js handles paths correctly)
npm run typecheck

# Lint
npm run lint
```

---

## Architecture Notes

- **State:** Dashboard uses React Context + localStorage for inventory. No database for MVP.
- **Auth:** Simple password hash (`demo`) via PBKDF2. Replace with proper auth for production.
- **Middleware:** `middleware.ts` handles dashboard auth routes. Uses Node.js `crypto` (shows Edge Runtime warning but does not block build).
- **Tailwind v4:** Uses `@import "tailwindcss"` syntax, `@theme inline` for CSS variables.
