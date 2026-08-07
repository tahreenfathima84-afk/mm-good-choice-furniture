# PRD — M M Good Choice Furniture (Official Website)

## Original Problem Statement
Build a complete, production-ready, Awwwards-level luxury website for M M Good Choice Furniture, a wooden furniture dealer (10+ yrs) in Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru 560036. Open daily till 7:30 PM. Phone +91 91106 90642. Warm luxury palette (no black/white), Poppins/Manrope/Inter typography, cinematic loading screen, glass navbar, kinetic hero with masked line reveal, 11 product categories with prices, masonry gallery + lightbox, Why Choose Us, testimonials, animated stats, contact + map + luxury form, WhatsApp deep-links (wa.me/919110690642), click-to-call, hidden owner dashboard (Google auth) managing products/gallery/prices/offers/enquiries, premium motion (framer-motion + lenis), responsive + SEO.

## User Personas
- Local Bengaluru homeowner (TC Palya / KR Puram / Hoodi) browsing on mobile, wants prices, photos, WhatsApp contact fast
- Villa/apartment owner wanting custom furniture, uses quote form
- Business owner (non-technical) managing catalogue, offers and enquiries from phone via Google login

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis + react-fast-marquee + sonner (CRA/craco, port 3000)
- Backend: FastAPI (port 8001, /api prefix) + MongoDB (motor)
- Auth: Emergent-managed Google OAuth → session_token (httpOnly cookie, 7 days) stored in user_sessions; first Google login becomes owner (role bootstrap)
- DB collections: users, user_sessions, products, gallery, enquiries, settings
- Images: curated verified Unsplash stock (owner can also upload photos as data-URL)

## Implemented (2026-08-06)
- Cinematic loading screen (espresso, gold MM monogram, particles, masked reveal)
- Floating glass navbar with scroll-spy animated underline, mobile menu
- Kinetic hero: slow 14s zoom, parallax, masked line-by-line title reveal (100px+ desktop), 5 CTAs (Explore, WhatsApp, Call, Visit, Directions)
- Offer banner (owner-editable, toggleable)
- Editorial slow marquee of categories
- Collections: 12 seeded products, category filter pills, price labels, sizes chips, Request Quote (prefills contact form) + WhatsApp per product
- Why Choose Us: 8 numbered manifesto chapters + animated stat counters (10+/5000+/3000+/100+)
- Masonry gallery (24 photos) with fullscreen lightbox (zoom, prev/next, keyboard, lazy loading)
- Testimonials (4 cards, photos, 5-star)
- Contact: click-to-call, WhatsApp, directions, Google Maps embed, luxury enquiry form → saved to DB
- Footer with hidden Owner Login link
- Owner dashboard /owner: Google login, overview stats, product CRUD (URL or file upload), gallery add/delete, enquiries view/delete/WhatsApp-reply, settings (offer, hero subtitle, phone, hours, address)
- SEO: meta, OG tags, JSON-LD FurnitureStore schema
- Motion: lenis smooth scroll, magnetic buttons, mouse glow, back-to-top, scroll reveals throughout

## Updates (2026-08-07)
- Testimonials rebuilt: 6 natural Indian-English sample reviews (Bengaluru areas, varied ratings/styles), initial-based avatars (no stock photos), per-review purchase context, verified badge support (renders only when verified: true; all current entries marked sample/verified: false in data)
- Product search: case-insensitive keyword search with category-mapped synonyms (tv→TV/LCD stands, dining→dining tables, shoe→shoe racks, etc.)
- Category filter groups: All, Tables, Sofas, Beds, TV / LCD Stands, Shoe Racks, Wardrobes, Office Furniture, Custom Furniture
- Search + filter combine (e.g. Beds + "king" → only king beds); elegant empty state with "No furniture found matching your search." + Clear Search button
- Mobile: search bar full-width, category pills horizontally scrollable, results animate with staggered fade/scale (no page reload)

## Backlog
- P0: Real owner must sign in once at /owner to claim ownership (then remove test user)
- P1: Replace stock photos with real showroom photography via dashboard uploads
- P1: Enquiry email/SMS notification to owner (Resend/Twilio)
- P2: Product detail pages, multi-image per product
- P2: Blog / care guides for SEO, sitemap.xml + robots.txt
- P2: Instagram feed section

## Next Tasks
1. Owner claims dashboard via Google sign-in
2. Upload real product/gallery photos, prune seeded stock
3. Add enquiry notifications
