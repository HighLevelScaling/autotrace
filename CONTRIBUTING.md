# Contributing to AutoTrace

Thank you for your interest in contributing to AutoTrace! This document will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (we recommend 20 LTS)
- npm 9+ or yarn 1.22+
- Git

### Development Setup

```bash
# 1. Fork the repo (click the Fork button on GitHub)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/autotrace.git
cd autotrace

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Dealer Dashboard Access
- Go to `http://localhost:3000/dashboard/login`
- Password: `demo`

---

## 📁 Project Structure

```
autotrace/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── dashboard/          # Dealer portal (auth-protected)
│   ├── report/             # Public vehicle reports
│   ├── bulk/               # Public bulk upload
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── dashboard-shell.tsx # Dashboard layout
├── lib/                    # Core logic
│   ├── acquisition-engine.ts  # Buy/caution/avoid scoring
│   ├── condition-score.ts     # 1-100 condition algorithm
│   ├── mock-engine.ts         # Deterministic data generation
│   ├── vin-decoder.ts         # VIN parsing
│   ├── types.ts               # TypeScript types
│   └── dashboard/             # Auth & inventory contexts
└── public/                 # Static assets
```

---

## 🎯 What to Work On

Check our [Roadmap in README.md](./README.md#roadmap) for planned features.

### High-priority areas:

1. **Real API Integrations**
   - NMVTIS (vehiclehistory.gov)
   - State DMV APIs
   - Carfax/AutoCheck commercial APIs
   - NHTSA recall data

2. **Testing**
   - Unit tests for scoring algorithms
   - Integration tests for API routes
   - E2E tests for critical user flows

3. **Mobile Experience**
   - Dashboard sidebar improvements on mobile
   - Touch-friendly table interactions
   - Responsive chart layouts

4. **Accessibility**
   - ARIA labels on interactive elements
   - Keyboard navigation
   - Color contrast improvements
   - Screen reader testing

5. **International Support**
   - EU VIN patterns (WMI codes)
   - UK/European make/model databases
   - Metric unit support

---

## 📝 Code Style

- We use **TypeScript** for everything
- Components use **PascalCase** (`VehicleHeader.tsx`)
- Utilities use **camelCase** (`calculateScore.ts`)
- CSS uses **Tailwind** utility classes
- Prefer **server components** where possible
- Client components must include `'use client'`

---

## 🔄 Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, typed code
   - Add comments for complex logic
   - Update docs if needed

3. **Test locally**
   ```bash
   npm run build
   ```
   Ensure the build passes with zero TypeScript errors.

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add wholesale alert notifications"
   ```
   
   Prefix conventions:
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `docs:` — Documentation only
   - `style:` — Formatting, missing semicolons, etc.
   - `refactor:` — Code change that neither fixes a bug nor adds a feature
   - `test:` — Adding tests
   - `chore:` — Maintenance tasks

5. **Push and open a PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   In your PR description:
   - What changed and why
   - Screenshots (if UI changes)
   - How to test

6. **Code review**
   - Maintainters will review within 48 hours
   - Address feedback promptly
   - Be respectful and constructive

---

## 🐛 Reporting Bugs

Use [GitHub Issues](https://github.com/HighLevelScaling/autotrace/issues) and include:

- **Description** — What happened vs. what you expected
- **Steps to reproduce** — Numbered list
- **Environment** — Browser, OS, Node version
- **Screenshots** — If applicable
- **Error messages** — Console logs, network errors

---

## 💡 Feature Requests

We love ideas! Open an issue with:

- **Title** prefixed with `[Feature Request]:`
- **Problem** — What pain point does this solve?
- **Proposed solution** — Your idea
- **Alternatives** — Other ways to solve it
- **Additional context** — Mockups, references, examples

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [PolyForm Noncommercial License 1.0.0](./LICENSE).

---

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/HighLevelScaling/autotrace/discussions)
- Or reach out via the project maintainers

Thank you for helping make AutoTrace better! 🚗✨
