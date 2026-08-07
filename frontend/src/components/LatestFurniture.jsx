import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SearchX, MessageCircle, Eye, ChevronLeft, ChevronRight, BadgeCheck, Sparkles } from "lucide-react";
import { SectionHeading, Reveal, Magnetic, EASE } from "./Extras";
import { api, waLink, imgSrc } from "../lib/api";

const FILTERS = [
  { label: "ALL", match: null },
  { label: "SOFAS", match: ["Sofas"] },
  { label: "DINING", match: ["Dining Tables"] },
  { label: "BEDS", match: ["Beds"] },
  { label: "TV STANDS", match: ["LCD / TV Stands"] },
  { label: "SHOE RACKS", match: ["Shoe Racks"] },
  { label: "WARDROBES", match: ["Wardrobes"] },
  { label: "OFFICE", match: ["Office Furniture"] },
  { label: "COFFEE TABLES", match: ["Coffee Tables"] },
  { label: "OTHER", match: ["Other Furniture"] },
];

const SEARCH_MAP = [
  { keys: ["tv", "lcd", "led", "television"], cats: ["LCD / TV Stands"] },
  { keys: ["dining"], cats: ["Dining Tables"] },
  { keys: ["table"], cats: ["Dining Tables", "Coffee Tables"] },
  { keys: ["coffee"], cats: ["Coffee Tables"] },
  { keys: ["bed", "cot"], cats: ["Beds"] },
  { keys: ["sofa", "couch", "seater"], cats: ["Sofas"] },
  { keys: ["shoe", "footwear"], cats: ["Shoe Racks"] },
  { keys: ["wardrobe", "almirah", "closet"], cats: ["Wardrobes"] },
  { keys: ["office", "desk", "study"], cats: ["Office Furniture"] },
];

const matchesSearch = (item, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const hay = `${item.name} ${item.category} ${item.description}`.toLowerCase();
  if (hay.includes(q)) return true;
  return SEARCH_MAP.some((g) => g.keys.some((k) => q.includes(k)) && g.cats.includes(item.category));
};

const waProduct = (item) =>
  waLink(`Hello M M Good Choice Furniture, I am interested in the ${item.name} (${item.category}) shown on your website. Please share more photos, availability and details.`);

function NewBadge() {
  return (
    <span data-testid="new-arrival-badge" className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 font-btn text-[10px] font-bold tracking-[0.15em] uppercase text-espresso shadow-luxury animate-pulse-soft">
      <Sparkles size={11} /> New Arrival
    </span>
  );
}

function CatalogueCard({ item, index, onView, featured = false }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.65, delay: (index % 6) * 0.06, ease: EASE }}
      data-testid={`latest-card-${item.catalogue_id}`}
      className={`group overflow-hidden rounded-3xl bg-cream shadow-luxury transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-lift ${featured ? "w-[300px] shrink-0 snap-start sm:w-[340px]" : ""}`}
    >
      <button
        data-testid={`latest-image-${item.catalogue_id}`}
        onClick={() => onView(item)}
        className="relative block h-72 w-full overflow-hidden"
        aria-label={`View ${item.name}`}
      >
        <img
          src={imgSrc(item.image)}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-107"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
          {item.is_new && <NewBadge />}
          <span className="rounded-full glass px-3.5 py-1.5 font-btn text-[10px] font-semibold tracking-[0.15em] uppercase text-espresso">
            {item.category}
          </span>
        </div>
        <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full glass text-espresso opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <Eye size={16} />
        </span>
      </button>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">{item.name}</h3>
          {item.price_label && <span className="whitespace-nowrap font-display text-sm font-bold text-copper">{item.price_label}</span>}
        </div>
        {item.description && <p className="mt-2 text-sm leading-relaxed text-inksoft">{item.description}</p>}
        <div className="mt-5 flex gap-3">
          <button
            data-testid={`latest-view-details-${item.catalogue_id}`}
            onClick={() => onView(item)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-espresso/15 py-3 font-btn text-xs font-semibold tracking-wide text-espresso transition-colors duration-300 hover:border-copper hover:text-copper"
          >
            <Eye size={14} /> View Details
          </button>
          <Magnetic strength={0.2} className="flex-1">
            <a
              data-testid={`latest-whatsapp-${item.catalogue_id}`}
              href={waProduct(item)}
              target="_blank" rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-olive py-3 font-btn text-xs font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-copper"
            >
              <MessageCircle size={14} /> Ask on WhatsApp
            </a>
          </Magnetic>
        </div>
      </div>
    </motion.article>
  );
}

const CATEGORY_ORDER = ["Sofas", "Dining Tables", "Beds", "LCD / TV Stands", "Shoe Racks", "Wardrobes", "Office Furniture", "Coffee Tables", "Other Furniture"];

function CategoryRow({ category, items, onView }) {
  const rowRef = useRef(null);
  const slug = category.replace(/[\s/]+/g, "-").toLowerCase();
  const scroll = (d) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.75, behavior: "smooth" });
  };
  return (
    <div className="mt-14">
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{category}</h3>
            <p className="mt-1 font-btn text-[11px] font-semibold tracking-[0.25em] uppercase text-copper">
              {items.length} {items.length === 1 ? "Piece" : "Pieces"}
            </p>
          </div>
          <div className="flex gap-2">
            <button data-testid={`row-prev-${slug}`} onClick={() => scroll(-1)} aria-label={`Scroll ${category} left`} className="grid h-11 w-11 place-items-center rounded-full border border-espresso/15 text-espresso transition-colors duration-300 hover:bg-espresso hover:text-cream">
              <ChevronLeft size={18} />
            </button>
            <button data-testid={`row-next-${slug}`} onClick={() => scroll(1)} aria-label={`Scroll ${category} right`} className="grid h-11 w-11 place-items-center rounded-full border border-espresso/15 text-espresso transition-colors duration-300 hover:bg-espresso hover:text-cream">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Reveal>
      <div
        ref={rowRef}
        data-testid={`category-row-${slug}`}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <CatalogueCard key={item.catalogue_id} item={item} index={i} onView={onView} featured />
        ))}
      </div>
    </div>
  );
}

export default function LatestFurniture() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [viewerIndex, setViewerIndex] = useState(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    api.get("/catalogue").then((r) => {
      if (Array.isArray(r.data)) setItems(r.data);
    }).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.label === filter);
    return items.filter((i) => (!f?.match || f.match.includes(i.category)) && matchesSearch(i, query));
  }, [items, filter, query]);

  const featured = useMemo(() => items.filter((i) => i.is_featured), [items]);
  const isDefaultView = filter === "ALL" && !query.trim();

  const openItem = (item) => {
    const idx = visible.findIndex((v) => v.catalogue_id === item.catalogue_id);
    setZoomed(false);
    setViewerIndex(idx >= 0 ? idx : 0);
  };
  const closeViewer = useCallback(() => setViewerIndex(null), []);
  const stepViewer = useCallback(
    (d) => { setZoomed(false); setViewerIndex((i) => (i + d + visible.length) % visible.length); },
    [visible.length]
  );

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") stepViewer(1);
      if (e.key === "ArrowLeft") stepViewer(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerIndex, closeViewer, stepViewer]);

  const current = viewerIndex !== null ? visible[viewerIndex] : null;

  return (
    <section id="latest-furniture" data-testid="latest-furniture-section" className="noise-overlay relative bg-stone/50 py-24 md:py-32">
      <div className="mx-auto w-[min(1240px,94%)]">
        <div className="text-center">
          <Reveal>
            <span className="inline-block text-xs font-btn font-semibold tracking-[0.3em] uppercase text-copper">
              Our Latest Furniture
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl lg:text-6xl">
              Fresh from our workshop.
            </h2>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-inksoft">
              Explore our latest collection of furniture, photographed from our real products and selected for modern Indian homes.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-4 font-btn text-[11px] font-semibold tracking-[0.35em] uppercase text-gold">
              Real Furniture · Real Collection · M M Good Choice
            </p>
          </Reveal>
        </div>

        {featured.length > 0 && (
          <Reveal delay={0.15} className="mt-14">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck size={17} className="text-copper" />
              <p className="font-btn text-xs font-semibold tracking-[0.25em] uppercase text-inksoft">Featured This Week</p>
            </div>
            <div
              data-testid="featured-showcase"
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {featured.map((item, i) => (
                <CatalogueCard key={item.catalogue_id} item={item} index={i} onView={openItem} featured />
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.2} className="mt-12">
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-mutedwarm" />
            <input
              data-testid="latest-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search our latest sofas, beds, dining tables..."
              className="w-full rounded-full border border-ink/10 bg-cream py-4 pl-12 pr-12 text-sm text-ink shadow-luxury outline-none transition-colors duration-300 placeholder:text-mutedwarm focus:border-copper"
            />
            {query && (
              <button data-testid="latest-search-clear" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-mutedwarm transition-colors hover:text-copper">
                <X size={17} />
              </button>
            )}
          </div>
          <div
            data-testid="latest-category-filters"
            className="mt-5 flex justify-start gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center"
          >
            {FILTERS.map((f) => (
              <button
                key={f.label}
                data-testid={`latest-filter-${f.label.replace(/[\s/]+/g, "-").toLowerCase()}`}
                onClick={() => setFilter(f.label)}
                className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 font-btn text-xs font-semibold tracking-wide transition-colors duration-300 ${filter === f.label ? "bg-espresso text-cream" : "bg-cream text-inksoft hover:bg-stone"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            data-testid="latest-no-results"
            className="mt-12 flex flex-col items-center rounded-3xl bg-cream px-8 py-16 text-center shadow-luxury"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-stone/70 text-copper">
              <SearchX size={26} />
            </span>
            <p className="mt-6 font-display text-xl font-bold text-ink">No furniture found matching your search.</p>
            <button
              data-testid="view-all-furniture-button"
              onClick={() => { setQuery(""); setFilter("ALL"); }}
              className="mt-7 rounded-full bg-espresso px-7 py-3 font-btn text-xs font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-copper"
            >
              View All Furniture
            </button>
          </motion.div>
        ) : isDefaultView ? (
          <div data-testid="category-rows">
            {CATEGORY_ORDER.map((cat) => {
              const catItems = visible.filter((i) => i.category === cat);
              return catItems.length > 0 ? <CategoryRow key={cat} category={cat} items={catItems} onView={openItem} /> : null;
            })}
          </div>
        ) : (
          <motion.div layout className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((item, i) => (
                <CatalogueCard key={item.catalogue_id} item={item} index={i} onView={openItem} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            data-testid="latest-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-espresso/95 p-4 backdrop-blur-xl"
            onClick={closeViewer}
          >
            <button data-testid="latest-viewer-close" onClick={closeViewer} aria-label="Close" className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full glass-dark text-cream transition-colors hover:bg-copper">
              <X size={20} />
            </button>
            {visible.length > 1 && (
              <>
                <button data-testid="latest-viewer-prev" onClick={(e) => { e.stopPropagation(); stepViewer(-1); }} aria-label="Previous" className="absolute left-3 sm:left-8 z-10 grid h-12 w-12 place-items-center rounded-full glass-dark text-cream transition-colors hover:bg-copper">
                  <ChevronLeft size={22} />
                </button>
                <button data-testid="latest-viewer-next" onClick={(e) => { e.stopPropagation(); stepViewer(1); }} aria-label="Next" className="absolute right-3 sm:right-8 z-10 grid h-12 w-12 place-items-center rounded-full glass-dark text-cream transition-colors hover:bg-copper">
                  <ChevronRight size={22} />
                </button>
              </>
            )}
            <motion.figure
              key={current.catalogue_id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl shadow-lift">
                <motion.img
                  data-testid="latest-viewer-image"
                  src={imgSrc(current.image)}
                  alt={current.name}
                  onClick={() => setZoomed((z) => !z)}
                  animate={{ scale: zoomed ? 1.7 : 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="max-h-[62vh] w-full cursor-zoom-in object-contain bg-espresso"
                />
              </div>
              <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-xl font-bold text-cream">{current.name}</p>
                    {current.is_new && <NewBadge />}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-cream/70">
                    {current.category}{current.price_label ? ` · ${current.price_label}` : ""}
                  </p>
                </div>
                <a
                  data-testid="latest-viewer-whatsapp"
                  href={waProduct(current)}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-olive px-7 py-3.5 font-btn text-sm font-semibold text-cream transition-colors duration-300 hover:bg-copper"
                >
                  <MessageCircle size={16} /> Ask on WhatsApp
                </a>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
