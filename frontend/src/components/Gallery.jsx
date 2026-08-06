import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading, Reveal, EASE } from "./Extras";
import { FALLBACK_GALLERY } from "../lib/content";
import { api } from "../lib/api";

export default function Gallery() {
  const [items, setItems] = useState(FALLBACK_GALLERY);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    api.get("/gallery").then((r) => {
      if (Array.isArray(r.data) && r.data.length) setItems(r.data);
    }).catch(() => {});
  }, []);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d) => setIndex((i) => (i + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, step]);

  return (
    <section id="gallery" data-testid="gallery-section" className="noise-overlay relative bg-matcha py-24 md:py-32">
      <div className="mx-auto w-[min(1240px,94%)]">
        <SectionHeading label="The Gallery" title={<>Rooms our furniture<br />calls home.</>} align="center" />
        <div className="masonry mt-16">
          {items.map((g, i) => (
            <Reveal key={g.image_id} delay={(i % 5) * 0.05} y={30}>
              <button
                data-testid={`gallery-item-${g.image_id}`}
                onClick={() => setIndex(i)}
                className="group relative block w-full overflow-hidden rounded-3xl"
              >
                <img
                  src={g.url}
                  alt={g.title || "Furniture gallery image"}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-107"
                />
                <div className="absolute inset-0 bg-espresso/0 transition-colors duration-500 group-hover:bg-espresso/25" />
                {g.title && (
                  <span className="absolute bottom-4 left-4 translate-y-3 rounded-full glass px-4 py-1.5 font-btn text-xs font-semibold text-espresso opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {g.title}
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {index !== null && items[index] && (
          <motion.div
            data-testid="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-espresso/95 p-4 backdrop-blur-xl"
            onClick={close}
          >
            <button data-testid="lightbox-close" onClick={close} aria-label="Close" className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full glass-dark text-cream transition-colors hover:bg-copper">
              <X size={20} />
            </button>
            <button
              data-testid="lightbox-prev"
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Previous image"
              className="absolute left-3 sm:left-8 z-10 grid h-12 w-12 place-items-center rounded-full glass-dark text-cream transition-colors hover:bg-copper"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              data-testid="lightbox-next"
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Next image"
              className="absolute right-3 sm:right-8 z-10 grid h-12 w-12 place-items-center rounded-full glass-dark text-cream transition-colors hover:bg-copper"
            >
              <ChevronRight size={22} />
            </button>
            <motion.figure
              key={items[index].image_id}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="max-h-[85vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={items[index].url} alt={items[index].title || "Gallery"} className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-lift" />
              <figcaption className="mt-4 text-center font-btn text-sm font-semibold tracking-wide text-cream/80">
                {items[index].title} · {index + 1} / {items.length}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
