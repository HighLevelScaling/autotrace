# AutoTrace 🚗

> **Premium Vehicle Intelligence Platform**
>
> Uncover your vehicle's complete story — and help dealerships buy smarter, sell faster, and profit more.

[![License: PolyForm-Noncommercial-1.0.0](https://img.shields.io/badge/License-PolyForm--Noncommercial-blue.svg)](https://polyformproject.org/licenses/noncommercial/1.0.0/)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## ✨ Features

### For Consumers (Free)
- 🔍 **VIN, License Plate & Driver's License Lookup**
- 🪪 **DMV Validation** — Real-time license status, restrictions, expiry
- 🚘 **Registration History** — Plate, state, issue/renewal dates
- 🎫 **Ticket History** — Violations, fines, points, payment status
- 🔄 **Transfer History** — Ownership timeline with mileage
- 💥 **Accident History** — Severity, damage estimates, airbag, injuries
- 🔧 **Service History** — Maintenance records with costs
- 📊 **Condition Score** — 1-100 score based on complete history
- 🏷️ **Title Brand History** — Clean, salvage, rebuilt, flood, lemon detection
- 💰 **Market Value Estimate** — Wholesale-to-retail price range
- 🚩 **Red Flag Detection** — Auto-identify high-risk vehicles
- 📄 **PDF Report Generator** — Branded, printable vehicle reports

### For Dealers (B2B Portal)
- 📋 **Inventory Management** — Track all vehicles on your lot
- 💵 **Profit Calculator** — Purchase + recon → listed price = true net profit
- 📈 **Acquisition Analyzer** — Upload auction run lists, get BUY/CAUTION/AVOID scores
- ⏰ **Lot Aging Dashboard** — Days on lot, floor plan costs, wholesale alerts
- 👁️ **Competitive Market Lens** — See competitor pricing and positioning
- 📊 **Analytics** — Inventory distribution, profit by status, risk summary
- 📤 **Bulk VIN Processing** — Upload 1,000 VINs via CSV
- 🖨️ **Customer Report PDFs** — One-click branded reports for buyers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or 20+)
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/HighLevelScaling/autotrace.git
cd autotrace

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Dealer Dashboard Login
- Navigate to `/dashboard/login`
- Password: `demo`

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | React Context + localStorage |
| Deployment | Vercel |

---

## 📡 API

### POST `/api/lookup`

**Single Vehicle Lookup**
```json
{
  "type": "vin",
  "value": "1HGCV1F3XNA123456"
}
```

**Bulk Processing**
```json
{
  "bulk": true,
  "vins": ["1HGCV1F3XNA123456", "1FTFW1EF7EKE12345"]
}
```

**Acquisition Analysis**
```json
{
  "analyze": true,
  "vins": ["1HGCV1F3XNA123456", "1FTFW1EF7EKE12345"]
}
```

---

## 🧠 How the Acquisition Scoring Works

Our acquisition engine scores every vehicle on a 1-100 scale:

| Factor | Penalty | Why |
|--------|---------|-----|
| Salvage title | -30 | Drastically affects resale |
| Total loss | -35 | Structural damage likely |
| Flood damage | -28 | Electrical issues persist |
| Odometer rollback | -25 | Fraud indicator |
| Major accident | -18 | Recon costs skyrocket |
| Condition score < 60 | -12 | Poor overall health |
| Excessive tickets | -10 | Neglect indicator |
| No service history | -8 | Unknown maintenance |

**Recommendation thresholds:**
- **80-100** = BUY ✅
- **60-79** = CAUTION ⚠️
- **0-59** = AVOID ❌

**True Net Profit formula:**
```
Listed Price - Max Bid - Recon - Floor Plan - Marketing = Net Profit
```

---

## 🗺️ Roadmap

- [x] Consumer vehicle history reports
- [x] Dealer dashboard with inventory management
- [x] Bulk VIN processing
- [x] Acquisition analyzer (buy/caution/avoid)
- [x] Lot aging with floor plan tracking
- [x] Competitive market lens
- [x] PDF report generation
- [ ] Real DMV API integrations
- [ ] Webhook alerts (new accidents, tickets)
- [ ] Stripe billing & subscription tiers
- [ ] API key management for B2B partners
- [ ] Mobile app (React Native)
- [ ] White-label configuration

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Areas we need help:
- 🔌 Real DMV/NMVTIS API integrations
- 📱 Mobile-responsive improvements
- 🧪 Test coverage
- 🌍 International VIN support (EU, Asia)
- ♿ Accessibility (a11y)
- 📝 Documentation

---

## 📄 License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

- ✅ Free for personal, educational, and non-commercial use
- ❌ Commercial use requires a separate license

See [LICENSE](./LICENSE) for full terms.

Interested in a commercial license for your dealership or business? Contact us.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

<p align="center">
  <strong>AutoTrace</strong> — Know before you buy.
</p>
