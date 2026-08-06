import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, FileText } from "lucide-react";
import { SectionHeading, Reveal, Magnetic, scrollToId, EASE } from "./Extras";
import { CATEGORIES, FALLBACK_PRODUCTS } from "../lib/content";
import { api, waLink } from "../lib/api";

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

  useEffect(() => {
    api.get("/products").then((r) => {
      if (Array.isArray(r.data) && r.data.length) setProducts(r.data);
    }).catch(() => {});
  }, []);

  const cats = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);
  const visible = filter === "All" ? products : products.filter((p) => p.category === filter);

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
          <div className="flex flex-wrap gap-2" data-testid="category-filters">
            {cats.map((c) => (
              <button
                key={c}
                data-testid={`filter-${c.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setFilter(c)}
                className={`rounded-full px-5 py-2.5 font-btn text-xs font-semibold tracking-wide transition-colors duration-300 ${filter === c ? "bg-espresso text-cream" : "bg-cream text-inksoft hover:bg-stone"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => <ProductCard key={p.product_id} p={p} index={i} />)}
          </AnimatePresence>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 4).map((c, i) => (
            <Reveal key={c.name} delay={i * 0.08}>
              <button
                data-testid={`category-tile-${c.name.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setFilter(c.name)}
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
          ))}
        </div>
      </div>
    </section>
  );
}
