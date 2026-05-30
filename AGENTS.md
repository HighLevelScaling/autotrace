<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AutoTrace — Agent Memory & Project Context

> Last updated: 2026-05-30
> Current deployment: https://my-app-liard-eta-10.vercel.app

## Project Overview

AutoTrace is a premium vehicle intelligence platform with:
- **Consumer tools:** VIN/plate/DL lookup, full vehicle history reports
- **PriceBeacon:** Live car pricing intelligence (/pricebeacon)
- **Dealer Dashboard:** Inventory management, acquisition analyzer, profit calculator
- **Telegram Bot:** AI-powered conversational bot + Vercel deployment alerts

## Tech Stack

- Next.js 16.2.6 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Framer Motion
- Geist font (Sans + Mono)
- lucide-react (icons at strokeWidth={1} ONLY)

## Design System (Awwwards-Tier)

### Absolute Zero — Banned Patterns
- NO Inter/Roboto/Arial/Helvetica
- NO thick Lucide icons (strokeWidth must be 1)
- NO generic 1px solid gray borders
- NO edge-to-edge sticky navbars
- NO linear or ease-in-out transitions
- NO h-screen (always use min-h-[100dvh])

### Vibe Archetype: Ethereal Glass
- Background: OLED black `#050505`
- Radial gradient orbs (indigo/purple) with blur
- Cards: `rgba(255,255,255,0.03)` with `backdrop-blur-2xl`
- Borders: pure white/10 hairlines

### Double-Bezel (Doppelrand) — Universal Pattern
Every card/container MUST use nested architecture:
```tsx
// Outer Shell
<div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
  // Inner Core
  <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
    {/* content */}
  </div>
</div>
```

### Motion Choreography
- ALL transitions: `cubic-bezier(0.32, 0.72, 0, 1)`
- Durations: 500ms–800ms
- Scroll reveals: `whileInView` with `translate-y-16 blur-md opacity-0` → `translate-y-0 blur-0 opacity-100`
- GPU-safe only: animate `transform` and `opacity`, never `top/left/width/height`

### Button Architecture
- Primary CTAs: `rounded-full px-6 py-3`
- Magnetic physics: `active:scale-[0.98]`
- Button-in-Button trailing icon: inner `w-8 h-8 rounded-full bg-black/5` with diagonal hover translate

## Architecture

### Navigation
- `components/fluid-island-nav.tsx` — Floating glass pill (not edge-to-edge)
- `components/mobile-menu-overlay.tsx` — Full-screen overlay with staggered mask reveal
- Links: Home, PriceBeacon, Bulk Upload, Dealer Dashboard

### Key Components
- `components/ui/glass-card.tsx` — Reusable Double-Bezel wrapper
- `components/ui/button.tsx` — shadcn/ui with pill variants + magnetic physics
- `components/search-island.tsx` — Centerpiece search with tab switching
- `components/report-dashboard.tsx` — Vehicle report with staggered sections
- `components/dashboard-shell.tsx` — Dealer dashboard layout

### API Routes
- `/api/lookup` — Vehicle lookup (VIN/plate/DL)
- `/api/vercel-webhook` — Receives Vercel deployment events, sends Telegram alerts
- `/api/vercel-webhook/test` — Test Telegram connection
- `/api/telegram-bot` — Conversational bot webhook (OpenAI GPT-4o-mini)
- `/api/auth/*` — Dashboard auth (password: demo)

### Pages
- `/` — Landing page (asymmetrical bento, editorial split)
- `/pricebeacon` — Live vehicle pricing dashboard
- `/bulk` — CSV VIN upload + batch processing
- `/report` — Vehicle history report display
- `/dashboard/*` — Dealer portal (login: demo)

## Environment Variables

### Required for Telegram Bot
```
TELEGRAM_BOT_TOKEN=      # From @BotFather
TELEGRAM_CHAT_ID=        # Your Telegram chat ID
```

### Required for AI Conversations
```
OPENAI_API_KEY=          # From platform.openai.com
```

### All Vercel Env Vars
| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot HTTP API token |
| `TELEGRAM_CHAT_ID` | Target chat for alerts |
| `OPENAI_API_KEY` | GPT-4o-mini for bot replies |

## Deployment

- Platform: Vercel
- Production URL: https://my-app-liard-eta-10.vercel.app
- Alias: https://my-app-liard-eta-10.vercel.app
- Build command: `npm run build`

## Telegram Bot Setup

### Webhook Configuration
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://my-app-liard-eta-10.vercel.app/api/telegram-bot"
```

### Bot Behavior
- Commands (`/start`, `/help`, `/status`, `/pricebeacon`, `/deploy`) → structured replies
- Natural language → GPT-4o-mini generated responses
- Vercel deployment events → automatic alert messages

## Important Notes

1. `.env.local` is gitignored. Never commit secrets.
2. The `middleware.ts` file uses Node.js `crypto` module which shows a warning in Edge Runtime but does not block the build.
3. All Lucide icons across the codebase must use `strokeWidth={1}`.
4. Film grain noise overlay is applied globally via `app/globals.css` (`.noise-overlay`).
5. Scroll behavior is smooth globally (`html { scroll-behavior: smooth; }`).
6. The project uses Tailwind CSS v4 syntax (`@import "tailwindcss"`, `@theme inline`).

## Feature Status

- [x] Consumer VIN lookup
- [x] Full vehicle history reports
- [x] PriceBeacon live pricing
- [x] Dealer dashboard with inventory
- [x] Bulk VIN processing
- [x] Acquisition analyzer
- [x] PDF report generation
- [x] Telegram bot with AI conversations
- [x] Vercel deployment alerts
- [ ] Real DMV API integrations
- [ ] Stripe billing & subscriptions
- [ ] Mobile app (React Native)
