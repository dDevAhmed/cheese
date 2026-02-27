# 🧀 Cheese Wallet — Landing Page

A production-ready Next.js 14 landing page for Cheese Wallet.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Fonts** — Playfair Display, Syne, Bebas Neue

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
cheese-wallet/
├── app/
│   ├── layout.tsx          # Root layout with fonts & metadata
│   ├── page.tsx            # Home page (assembles all sections)
│   ├── globals.css         # Global styles, CSS variables, animations
│   ├── about/page.tsx      # About page
│   ├── careers/page.tsx    # Careers page
│   ├── blog/page.tsx       # Blog page
│   └── support/page.tsx    # Support page
│
├── components/
│   ├── Navbar.tsx              # Sticky nav with smooth scroll + mobile menu
│   ├── Hero.tsx                # Hero with animated phone mockup
│   ├── Ticker.tsx              # Gold scrolling ticker
│   ├── Offers.tsx              # 5 offer cards grid
│   ├── Tiers.tsx               # Silver / Gold / Black tier cards
│   ├── HowItWorks.tsx          # 4-step grid
│   ├── TrustBar.tsx            # Security signals bar
│   ├── Testimonials.tsx        # 3 testimonial cards
│   ├── CTABand.tsx             # Final CTA section
│   ├── Footer.tsx              # Footer with all working links
│   ├── SectionLabel.tsx        # Reusable section eyebrow label
│   └── ScrollRevealProvider.tsx # IntersectionObserver reveal animations
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Working Links

| Link type | Behaviour |
|---|---|
| Nav links (`#offers`, `#tiers`, etc.) | Smooth scroll to section |
| CTA buttons | Smooth scroll to `#join` |
| Footer product links | Smooth scroll to sections |
| Footer company links | Navigate to `/about`, `/careers`, `/blog` |
| Footer social links | Open external in new tab |

## Customisation

- **Colors** — Edit CSS variables in `app/globals.css` (`:root {}`)
- **Content** — Each section is a self-contained component in `/components`
- **Fonts** — Swap in `app/layout.tsx` using `next/font/google`
- **Offers** — Edit the `offers` array in `components/Offers.tsx`
- **Tiers** — Edit the `tiers` array in `components/Tiers.tsx`
