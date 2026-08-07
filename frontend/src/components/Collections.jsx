import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, FileText, Search, X, SearchX } from "lucide-react";
import { SectionHeading, Reveal, Magnetic, scrollToId, EASE } from "./Extras";
import { CATEGORIES, FALLBACK_PRODUCTS } from "../lib/content";
import { api, waLink } from "../lib/api";

const FILTER_GROUPS = [
  { label: "All", match: null },
  { label: "Tables", match: ["Dining Tables", "Coffee Tables"] },
  { label: "Sofas", match: ["Luxury Sofas"] },
  { label: "Beds", match: ["Beds"] },
  { label: "TV / LCD Stands", match: ["TV Units", "LCD Stands"] },
  { label: "Shoe Racks", match: ["Shoe Racks"] },
  { label: "Wardrobes", match: ["Wardrobes"] },
  { label: "Office Furniture", match: ["Office Furniture"] },
  { label: "Custom Furniture", match: ["Custom Furniture"] },
];

const SEARCH_CATEGORY_MAP = [
  { keys: ["tv", "lcd", "led", "television"], cats: ["TV Units", "LCD Stands"] },
  { keys: ["dining"], cats: ["Dining Tables"] },
  { keys: ["table"], cats: ["Dining Tables", "Coffee Tables"] },
  { keys: ["coffee"], cats: ["Coffee Tables"] },
  { keys: ["bed", "cot"], cats: ["Beds"] },
  { keys: ["sofa", "couch", "seater"], cats: ["Luxury Sofas"] },
  { keys: ["shoe", "footwear"], cats: ["Shoe Racks"] },
  { keys: ["wardrobe", "almirah", "closet"], cats: ["Wardrobes"] },
  { keys: ["office", "desk", "study"], cats: ["Office Furniture"] },
  { keys: ["custom"], cats: ["Custom Furniture"] },
  { keys: ["storage"], cats: ["Storage Units"] },
];

const matchesSearch = (p, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const hay = `${p.name} ${p.category} ${p.description} ${(p.sizes || []).join(" ")}`.toLowerCase();
  if (hay.includes(q)) return true;
  return SEARCH_CATEGORY_MAP.some(
    (g) => g.keys.some((k) => q.includes(k)) && g.cats.includes(p.category)
  );
};

function ProductCard({ p, index }) {
  const requestQuote = () => {
    window.dispatchEvent(new CustomEvent("quote-product", { detail: p.name }));
    scrollToId("contact");
  };
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.7, delay: (index % 6) * 0.06, ease: EASE }}
      data-testid={`product-card-${p.product_id}`}
      className="group overflow-hidden rounded-3xl bg-cream shadow-luxury transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-lift"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          style={{ transform: "scale(1.001)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full glass px-4 py-1.5 font-btn text-[11px] font-semibold tracking-[0.15em] uppercase text-espresso">
          {p.category}
        </span>
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold tracking-tight text-ink">{p.name}</h3>
          <span className="whitespace-nowrap font-display text-sm font-bold text-copper">{p.price_label}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-inksoft">{p.description}</p>
        {p.sizes?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {p.sizes.map((s) => (
              <span key={s} className="rounded-full border border-copper/25 px-3 py-1 text-xs font-semibold text-copper">{s}</span>
            ))}
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <Magnetic strength={0.2} className="flex-1">
            <button
              data-testid={`product-quote-${p.product_id}`}
              onClick={requestQuote}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3 font-btn text-xs font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-copper"
            >
              <FileText size={14} /> Request Quote
            </button>
          </Magnetic>
          <Magnetic strength={0.2}>
            <a
              data-testid={`product-whatsapp-${p.product_id}`}
              href={waLink(`Hello! I'm interested in the ${p.name} (${p.price_label}). Please share more details.`)}
              target="_blank" rel="noreferrer"
              aria-label={`Ask about ${p.name} on WhatsApp`}
              className="grid h-11 w-11 place-items-center rounded-full bg-olive text-cream transition-colors duration-300 hover:bg-copper"
            >
              <MessageCircle size={16} />
            </a>
          </Magnetic>
        </div>
      </div>
    </motion.article>
  );
}

export default function Collections() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/products").then((r) => {
      if (Array.isArray(r.data) && r.data.length) setProducts(r.data);
    }).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const group = FILTER_GROUPS.find((g) => g.label === filter);
    return products.filter((p) => {
      const inGroup = !group?.match || group.match.includes(p.category);
      return inGroup && matchesSearch(p, query);
    });
  }, [products, filter, query]);

  const clearAll = () => { setQuery(""); setFilter("All"); };

  return (
    <section id="collections" data-testid="collections-section" className="noise-overlay relative bg-sand py-24 md:py-32">
      <div className="mx-auto w-[min(1240px,94%)]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading label="The Collections" title={<>Furniture that feels<br />like it belongs.</>} />
          <Reveal delay={0.15}>
            <p className="max-w-sm text-sm leading-relaxed text-inksoft">
              Eleven curated categories — from luxury sofas to made-to-order pieces — crafted in seasoned wood for Indian homes.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-10">
          <div className="relative max-w-xl">
            <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-mutedwarm" />
            <input
              data-testid="product-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sofas, beds, dining tables, TV stands..."
              className="w-full rounded-full border border-ink/10 bg-cream py-4 pl-12 pr-12 text-sm text-ink shadow-luxury outline-none transition-colors duration-300 placeholder:text-mutedwarm focus:border-copper"
            />
            {query && (
              <button
                data-testid="product-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mutedwarm transition-colors hover:text-copper"
              >
                <X size={17} />
              </button>
            )}
          </div>
          <div
            className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            data-testid="category-filters"
          >
            {FILTER_GROUPS.map((g) => (
              <button
                key={g.label}
                data-testid={`filter-${g.label.replace(/[\s/]+/g, "-").toLowerCase()}`}
                onClick={() => setFilter(g.label)}
                className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 font-btn text-xs font-semibold tracking-wide transition-colors duration-300 ${filter === g.label ? "bg-espresso text-cream" : "bg-cream text-inksoft hover:bg-stone"}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Reveal>

        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            data-testid="no-results-message"
            className="mt-12 flex flex-col items-center rounded-3xl bg-cream px-8 py-16 text-center shadow-luxury"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-stone/70 text-copper">
              <SearchX size={26} />
            </span>
            <p className="mt-6 font-display text-xl font-bold text-ink">No furniture found matching your search.</p>
            <p className="mt-2 max-w-sm text-sm text-inksoft">Try a different keyword or browse the full collection.</p>
            <button
              data-testid="clear-search-button"
              onClick={clearAll}
              className="mt-7 rounded-full bg-espresso px-7 py-3 font-btn text-xs font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-copper"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => <ProductCard key={p.product_id} p={p} index={i} />)}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 4).map((c, i) => {
            const tileToGroup = { "Luxury Sofas": "Sofas", "Beds": "Beds", "Dining Tables": "Tables", "TV Units": "TV / LCD Stands" };
            return (
            <Reveal key={c.name} delay={i * 0.08}>
              <button
                data-testid={`category-tile-${c.name.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => { setFilter(tileToGroup[c.name] || "All"); setQuery(""); scrollToId("collections"); }}
                className="group relative block h-44 w-full overflow-hidden rounded-3xl text-left"
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="font-display text-lg font-bold text-cream">{c.name}</p>
                  <p className="text-xs font-semibold tracking-wide text-gold">{c.count}</p>
                </div>
              </button>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
