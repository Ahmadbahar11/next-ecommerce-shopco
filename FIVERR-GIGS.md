# Fiverr Gig Launch Plan — Working Notes

Saved here so this survives even if the Claude chat is deleted. Just paste/reference this file in a new session to pick up where we left off.

## Background

- Freelancer: Ahmad Bahar, Software Engineer at Neuronix Technologies (Islamabad). Real stack: Next.js, React, Node.js, Express, TypeScript, MUI, Tailwind, PostgreSQL/MySQL, Redux/Zustand, Leaflet.js, Docker.
- Real portfolio proof (genuine, from resume — use these, don't fabricate more): migrated a production WordPress site to Next.js at work (+40% Lighthouse score, SSR for SEO); built RBAC-secured ERP dashboards; integrated JazzCash/EasyPaisa payment APIs; built an interactive property map with Leaflet.js (clustering + filters); ~35% frontend perf improvement via state cleanup/lazy loading; built 3 AI-integrated apps (AI CMS assistant, AI chatbot, AI task manager); personal projects: Loan Management System, Travel & Tour site (90+ Lighthouse).
- Goal: launch Fiverr gigs as a new seller (zero reviews), so pricing and gig choice are tuned for "easy to rank first" rather than maximum price.
- Gig images: 18 PNG-ready mockups (3 per gig x 6 gigs) built and saved locally at `C:\Users\muham\Documents\Fiverr Gig Images\fiverr-gig-images.html` — open in a browser, use each artboard's Export button to save individual PNGs.

## Launch order (phased, easiest-to-rank first)

1. **Week 1**: Leaflet.js Map + WordPress→Next.js Migration (lowest competition, best differentiation)
2. **Week 2-3**: add Node.js/Express REST API
3. **Week 4+**: add Frontend Website Design
4. **Hold until Level 1** (~60 days + 10 orders + 4.7★, raises gig limit from 7 to 10): Full-Stack Website Development, AI API Integration (most saturated categories — need review credibility first)

---

## Gig 1 — Leaflet.js Interactive Map Development

- **Title**: `I will create an interactive map using Leaflet js for your website`
- **Category**: Programming & Tech → Web Programming → Website Customization
- **Tags**: `leaflet js`, `react leaflet`, `marker clustering`, `store locator map`, `gis map`
- **Pricing** (market-checked against real Fiverr listings, $20-$280 range):

| | Basic | Standard | Premium |
|---|---|---|---|
| Name | Simple Leaflet Map | Map with Marker Clustering | Full Property Locator Map |
| Price | $25 | $60 | $120 |
| Delivery | 2 days | 3 days | 5 days |
| Revisions | 1 | 2 | 3 |

- **Description**: I build interactive maps using Leaflet.js — from a simple location marker to a full property/store locator with search and filtering. Real experience: built an interactive property map at my job with custom layers, marker clustering, and search filters. Includes: custom markers with popups, marker clustering for large datasets, search/filter functionality, responsive design, React/Next.js or plain HTML/JS integration.
- **FAQ**: Can pull from existing DB/API (share source/format first). Works with React via react-leaflet or plain Leaflet.js otherwise. Handles hundreds of markers well via clustering; 1000+ needs a scoping message first.
- **Buyer requirements**: (1) dataset/locations to map, (2) filtering/search features needed, (3) current site's tech stack.

---

## Gig 2 — WordPress to Next.js Migration

- **Title**: `I will migrate your WordPress site to Next js for speed and SEO`
- **Category**: Programming & Tech → Web Programming → Website Customization
- **Tags**: `nextjs migration`, `wordpress alternative`, `ssr seo`, `website speed optimization`, `react migration`
- **Pricing** (revised down after checking real competitors — original $200/$450/$900 was 2-8x market rate; real competitors charge $50-$120 for the whole migration):

| | Basic | Standard | Premium |
|---|---|---|---|
| Name | Single Page Nextjs Migration | Full Site Nextjs Migration | Nextjs Migration with CMS |
| Price | $50 | $110 | $220 |
| Delivery | 3 days | 6 days | 10 days |
| Revisions | 2 | 3 | 3 |

- **Description**: Real results: migrated a production WordPress property site to Next.js/TypeScript/MUI, +40% Lighthouse score, SSR for SEO. Includes: full visual/content migration, SSR, before/after Lighthouse audit, mobile-responsive rebuild, meta tags/sitemap/URL structure preserved.
- **FAQ**: SEO rankings preserved (URL structure/meta tags kept). Content editing after migration via headless CMS (Premium tier). Deployment guidance to Vercel available. Sites >8 pages need custom quote.
- **Buyer requirements**: (1) current WordPress URL, (2) page/section count, (3) need for ongoing content-editing ability.

---

## Gig 3 — Node.js/Express REST API Development

- **Title**: `I will build a REST API using Node js and Express js`
- **Category**: Programming & Tech → Backend Development
- **Tags**: `express js api`, `backend development`, `crud api`, `api development`, `postgresql api`
- **Pricing** (market-checked, $5-$250+ range, this sits mid-range — no change needed):

| | Basic | Standard | Premium |
|---|---|---|---|
| Name | Simple CRUD API | Full REST API with Database | REST API with Authentication |
| Price | $25 | $60 | $120 |
| Delivery | 2 days | 4 days | 6 days |
| Revisions | 1 | 2 | 3 |

- **Description**: Clean, production-holding REST APIs with Node.js/Express. Background: builds RESTful APIs + RBAC systems at current job; built a full Loan Management API from scratch. Includes: RESTful endpoints, PostgreSQL/MySQL integration, validation/error handling, optional JWT auth + RBAC.
- **FAQ**: Can connect to existing frontend (share stack). Deployment (Vercel/Render/VPS) addable. More than 3 endpoints → Standard/Premium.
- **Buyer requirements**: (1) what data the API manages, (2) actions needed (CRUD/search/etc.), (3) auth needed or not.

---

## Gig 4 — Frontend Website Design (React + Tailwind)

- **Title**: `I will design a responsive website frontend using React and Tailwind css`
- **Category**: Programming & Tech → Web Programming → Front-End Development
- **Tags**: `frontend developer`, `tailwind css design`, `mui design`, `responsive website`, `ui development`
- **Pricing** (market-checked, $15-$90 range):

| | Basic | Standard | Premium |
|---|---|---|---|
| Name | Single Page Frontend | Multi Page Frontend | Full Website Frontend |
| Price | $25 | $55 | $100 |
| Delivery | 2 days | 4 days | 7 days |
| Revisions | 1 | 2 | 3 |

- **Description**: Clean, modern, fully responsive frontends using React, Next.js, Tailwind, MUI. Includes: pixel-clean responsive layouts, reusable components, matches Figma/screenshot reference. Frontend-only — no backend (see Gig 6 for that).
- **FAQ**: Backend not included (see full-stack gig). Can match existing Figma/screenshot design. Tailwind or MUI, either.
- **Buyer requirements**: (1) design reference or look description, (2) pages/sections needed, (3) existing branding.

---

## Gig 5 — Full-Stack Website & Web App Development

- **Title**: `I will develop a full stack website using Next js React and Node js`
- **Category**: Programming & Tech → Full Stack Development
- **Tags**: `full stack developer`, `mern stack`, `web application development`, `dashboard development`, `crud website`
- **Pricing** (market-checked, $50-$700 range, most real gigs $50-$120):

| | Basic | Standard | Premium |
|---|---|---|---|
| Name | Basic Functional Website | Full Website with Database | Full Web App with Dashboard |
| Price | $70 | $180 | $350 |
| Delivery | 5 days | 10 days | 18 days |
| Revisions | 2 | 3 | 3 |

- **Description**: End-to-end builds — frontend + real backend logic (databases, auth, working forms, dashboards). Background: RBAC dashboards for production ERP, Loan Management System (full CRUD), Travel & Tour site (90+ Lighthouse), JazzCash/EasyPaisa payment integration.
- **FAQ**: Difference vs. frontend-only gig = real backend/DB/auth included. Payment processing addable (Stripe/PayPal/JazzCash). Deployment to Vercel/Render available. >10 pages/complex features → custom quote.
- **Buyer requirements**: (1) feature list, (2) page/section count, (3) database/login/admin dashboard needed.

---

## Gig 6 — AI API Integration (Chatbot & Content Assistant)

- **Title**: `I will integrate an AI chatbot into your website using OpenAI API`
- **Category**: Programming & Tech → AI Applications → AI Chatbot Integration
- **Tags**: `ai chatbot`, `openai integration`, `ai api integration`, `chatgpt integration`, `ai automation`
- **Pricing** (market-checked, $90-$295 range):

| | Basic | Standard | Premium |
|---|---|---|---|
| Name | Simple AI Chat Widget | AI Chatbot with History | AI Content Assistant |
| Price | $50 | $110 | $200 |
| Delivery | 2 days | 4 days | 6 days |
| Revisions | 1 | 2 | 3 |

- **Description**: Connects AI APIs (OpenAI-compatible) into React/Next.js apps. Background: built an AI chatbot with session history, an AI CMS content assistant (~30% writing time cut), an AI task manager (auto-priority/descriptions, ~25% less manual typing).
- **FAQ**: Buyer provides their own API key (billing on them). Works with existing apps (share stack). Non-OpenAI providers (Claude, Gemini) — confirm first.
- **Buyer requirements**: (1) existing app/repo or description, (2) what the AI should do, (3) which AI provider/API.

---

## Fiverr SEO notes (for filling the actual gig form)

- Keyword placement matters in 4 places: title, package tier names, 2-3x naturally in description, and the 5 tags (already applied above).
- Avoid keyword stuffing in titles — one clear keyword phrase, front-loaded.
- Gig images: 1280x769px, up to 3 per gig, keep text/logos ≥85-90px from left/right edges (mobile crops thumbnails).
- Level 0 sellers can have up to 7 active gigs; Level 1 (≈60 days + 10 orders + 4.7★) raises it to 10.

## Open next steps

- [ ] Export the 18 PNGs from `fiverr-gig-images.html` and upload to the first 2 gigs
- [ ] Create the actual Fiverr gigs for Leaflet Map + WordPress Migration first (per phased plan)
- [ ] Revisit pricing after first reviews land (raise ~10-20% after 10 reviews, again at Level 1/2)
