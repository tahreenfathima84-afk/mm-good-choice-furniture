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
- Enquiry email alerts (Emergent-managed Resend): every new enquiry triggers a branded HTML email to settings.notify_email; non-blocking (asyncio task), failures never break enquiry submission; recipient editable in dashboard Settings ("Enquiry Alert Email"), empty = alerts paused. Tested live with 202 Accepted.
- Customer auto-reply email: enquiry form now has optional Email field; if given, customer instantly gets a branded thank-you/confirmation email (reply-to: mmchoicefurnituremunawae@gmail.com). Verified live (202).
- Owner alert recipient set to mmchoicefurnituremunawae@gmail.com — NOTE: platform's deliverability protection returned 422 "undeliverable recipient" for this address on 2026-08-07; needs user to confirm spelling or use another address.
- SMS alerts (Twilio Messages API): fully wired (send_sms_alert, non-blocking, graceful skip); activates when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER are added to backend/.env; recipient = settings.notify_phone (dashboard "Enquiry Alert Phone (SMS)"). PENDING user Twilio credentials.

## Updates (2026-08-07, later)
- New "OUR LATEST FURNITURE" section (id=latest-furniture) placed between Testimonials and Contact: section intro (REAL FURNITURE · REAL COLLECTION · M M GOOD CHOICE), featured horizontal showcase, dedicated search + category filter pills (ALL/SOFAS/DINING/BEDS/TV STANDS/SHOE RACKS/WARDROBES/OFFICE/COFFEE TABLES/OTHER), premium product cards (NEW ARRIVAL badge, View Details, Ask on WhatsApp with product+category prefilled), fullscreen viewer (zoom toggle, prev/next, product info, WhatsApp), empty state with "View All Furniture"
- 5 REAL owner-uploaded sofa photos seeded into new `catalogue` Mongo collection; images enhanced presentation-only via Pillow pipeline (watermark-bar crop, gray-world white balance, autocontrast, brightness, sharpness) — furniture never altered; served as static files from /api/uploads/catalogue/
- Backend: GET /api/catalogue (public, hides hidden), GET /api/catalogue/all + POST/PUT/DELETE (owner); uploads accept data-URL photos, auto-enhance, save to /app/backend/uploads/catalogue/
- Owner dashboard: new "Latest Furniture" tab — add (photo+name+category+price+description+New/Featured), edit, replace photo, hide/restore, delete
- Catalogue expanded to 10 real products (5 new: 3+1+1 Sofa Set, 4-Seater Dining Table, TV Wall Unit, 6-Seater Dining Table, L-Shape Corner Sofa Set with Ottoman — all marked New Arrival, tan L-shape Featured); grid now xl:grid-cols-4 / lg:3 / sm:2 / mobile:1; Mongo-backed so it scales to 50+ products with no rebuild
- Floating WhatsApp button site-wide (bottom-right; desktop pill "WhatsApp Us", mobile compact circle; direct wa.me link with pre-filled message; back-to-top moved above it to avoid overlap)

## Updates (2026-08-07, final)
- OLD AI Gallery COMPLETELY REMOVED: Gallery.jsx deleted, section removed from Home, gallery collection dropped, backend /api/gallery endpoints + SEED_GALLERY + seeding removed, FALLBACK_GALLERY removed from content.js, dashboard Gallery tab removed
- Navigation: "Gallery" replaced with "Our Latest Furniture" (smooth-scrolls to #latest-furniture); footer quick links updated to match
- 5 real bed photos added to catalogue (Storage Bed, King Size Bed [Featured], Tufted Headboard Bed, Bed with Side Storage [auto-rotated upright], Wooden Bed) — Beds ₹8,500–₹40,000 with sizes 4×6/5×6.5/6×6.5; catalogue now 15 real products (7 sofas, 5 beds, 2 dining, 1 TV unit)

## Updates (2026-08-07, carousels)
- Navigation finalized in exact order: Home, About, Collections, Why Us, Our Latest Furniture, Contact (About anchors to the Why Us/Manifesto section via id="about"; Stories removed from nav, section remains on page)
- Our Latest Furniture default view restructured into per-category horizontal carousels (Sofas, Dining Tables, Beds, LCD/TV Stands, Shoe Racks, Wardrobes, Office, Coffee Tables, Other) with heading, piece count, left/right arrows, scroll-snap swipe on mobile (~1.2 cards visible); search/filter switches to results grid; viewer unchanged
- 5 more real photos added: 3-Door Wardrobe, Wall-Mounted TV Unit (Featured), 4-Door Wardrobe with Drawers, 4-Door Wardrobe, 2-Door Wardrobe with Mirror — catalogue now 20 real products (7 sofas, 5 beds, 4 wardrobes, 2 dining, 2 TV units)

## Updates (2026-08-07, AI catalogue expansion)
- 44 AI-generated furniture products added (Gemini 3.1 Flash Image / Nano Banana via EMERGENT_LLM_KEY): 5 each of Sofas, Dining Tables, Beds, LCD/TV Stands, Shoe Racks, Wardrobes, Office Furniture, Coffee Tables + 4 Other Furniture — consistent warm Indian showroom style, no people/text/logos, realistic local pricing (wardrobes ₹18,000–₹45,000, office ₹6,000–₹25,000, coffee ₹4,000–₹15,000, other ₹2,500–₹12,000)
- Catalogue total: 64 products (20 real + 44 AI); existing real products untouched
- PENDING: 45th image "Wooden Display Rack" (Other Furniture) failed — EMERGENT_LLM_KEY budget exceeded (2.99/2.93). User must top up: Profile → Manage plan → Universal Key → Add Balance, then re-run generation for that one item (script: /app/scripts/gen_furniture.py)

## Updates (2026-08-07, Collections filter bug fix)
- Fixed wrong image/product matching in Collections (products collection): Sliding Door Wardrobe had a bedroom image, Queen Size Bed with Storage had a sofa image, Compact Shoe Rack had a dining-table image, Classic LCD Stand had a pink wardrobe image — all replaced with correct premium images (reused existing generated catalogue images, copied to col_*.jpg files)
- Added 2 new wardrobe products to Collections (2-Door Wooden Wardrobe, 3-Door Wardrobe) — Wardrobes category now has 3 genuine wardrobe products
- Collections empty state updated: "No furniture found" / "Try another category or search term." / "View All Furniture" reset button
- Collections ProductCard now uses imgSrc() helper so backend-hosted images resolve correctly
- Verified: all 9 category filters, searches (sofa/bed/table/wardrobe/tv/shoe/office), search+filter combos (Beds+wood, Sofas+l-shape), empty state, reset, mobile

## Updates (2026-08-08, real-photos-only)
- REMOVED all 44 AI-generated catalogue products + their image files (identified by generation-batch created_at >= 2026-08-07T13:00); the 20 genuine owner photos untouched
- Added 5 new real owner photos: Designer Storage Bed (Beds), L-Shape Office Desk (Office Furniture), Premium Upholstered Bed (Beds, Featured), Sliding Door Wardrobe (Wardrobes), Sliding Wardrobe with Mirror (Wardrobes) — all New Arrival
- Catalogue now 25 products, ALL real photographs: Sofas 7, Beds 7, Wardrobes 6, Dining 2, TV Stands 2, Office 1
- Owner upload security re-verified: unauthenticated POST/PUT/DELETE /api/catalogue → 401; public GET read-only; owner management via existing dashboard "Latest Furniture" tab (upload/name/category/price/description/New/Featured/edit/replace/hide/delete)
- Added 5 more real owner photos (2026-08-08): Office Desk with Drawers (Office), Heart Design Bed (Beds), Diamond Design Bed (Beds, Featured), Study Desk with Shelves (Office), Pooja Cabinet (Other, ₹8,000–₹20,000) — catalogue now 30 real products: Sofas 7, Beds 9, Wardrobes 6, Office 3, Dining 2, TV Stands 2, Other 1
- Removed "Featured This Week" showcase block from Our Latest Furniture (public site only; is_featured flag remains in dashboard/data)
- Added 5 more real owner photos (2026-08-08, batch 2): Marble Finish 2-Door Wardrobe (Wardrobes), Designer Pooja Cabinet (Other), Marble Finish Office Desk (Office), 6-Seater Dining Set (Dining), Designer Bed with Side Tables (Beds) — catalogue now 35 real products
- Added 5 more real owner photos (2026-08-08, batch 3): 4-Seater Wooden Dining Set (Dining), Wooden Pooja Cabinet (Other), Marble Panel TV Wall Unit (TV), 2-Door Shoe Cabinet (Shoe Racks — first shoe rack), Designer TV Wall Unit (TV) — catalogue now 40 real products: Sofas 7, Beds 10, Wardrobes 7, Dining 4, TV 4, Office 4, Other 3, Shoe Racks 1
- Added 5 more real owner photos (2026-08-08, batch 4): Marble Finish TV Wall Unit (TV), Glass-Top 6-Seater Dining Table (Dining), Dark Wood 6-Seater Dining Table (Dining), Premium 6-Seater Dining Set (Dining), Pooja Mandir Cabinet (Other) — catalogue now 45 real products: Sofas 7, Beds 10, Wardrobes 7, Dining 7, TV 5, Office 4, Other 4, Shoe Racks 1

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
