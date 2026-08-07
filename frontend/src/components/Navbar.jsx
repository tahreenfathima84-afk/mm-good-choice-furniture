import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Menu, X } from "lucide-react";
import { scrollToId, EASE } from "./Extras";
import { PHONE_TEL, waLink } from "../lib/api";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "collections", label: "Collections" },
  { id: "why-us", label: "Why Us" },
  { id: "latest-furniture", label: "Our Latest Furniture" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id) => { setOpen(false); scrollToId(id); };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
      className="fixed top-4 left-1/2 z-50 w-[min(1240px,94%)] -translate-x-1/2"
    >
      <nav data-testid="main-navbar" className="glass flex items-center justify-between rounded-full px-5 py-3 sm:px-7">
        <button data-testid="nav-logo" onClick={() => go("home")} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-espresso text-gold font-display text-sm font-extrabold tracking-tighter">
            MM
          </span>
          <span className="hidden sm:block text-left leading-tight">
            <span className="block font-display text-sm font-extrabold tracking-tight text-ink">M M GOOD CHOICE</span>
            <span className="block text-[10px] font-btn font-semibold tracking-[0.35em] text-copper">FURNITURE</span>
          </span>
        </button>

        <ul className="hidden lg:flex items-center gap-8">
          {LINKS.map(({ id, label }) => (
            <li key={id}>
              <button
                data-testid={`nav-link-${id}`}
                onClick={() => go(id)}
                className={`group relative font-btn text-sm font-semibold transition-colors duration-300 ${active === id ? "text-espresso" : "text-inksoft hover:text-espresso"}`}
              >
                {label}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-gold to-copper transition-[width] duration-300 ${active === id ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            data-testid="nav-call-button"
            href={PHONE_TEL}
            className="hidden sm:grid h-10 w-10 place-items-center rounded-full border border-espresso/15 text-espresso transition-colors duration-300 hover:bg-espresso hover:text-cream"
            aria-label="Call now"
          >
            <Phone size={16} />
          </a>
          <a
            data-testid="nav-whatsapp-button"
            href={waLink("Hello M M Good Choice Furniture! I'd like to enquire about your furniture collection.")}
            target="_blank" rel="noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 font-btn text-sm font-semibold text-cream transition-colors duration-300 hover:bg-copper"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <button
            data-testid="nav-mobile-menu-button"
            onClick={() => setOpen(!open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-espresso/15 text-espresso lg:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="glass mt-3 rounded-3xl p-4 lg:hidden"
          >
            {LINKS.map(({ id, label }) => (
              <button
                key={id}
                data-testid={`nav-mobile-link-${id}`}
                onClick={() => go(id)}
                className="block w-full rounded-2xl px-5 py-3.5 text-left font-btn text-base font-semibold text-ink transition-colors duration-200 hover:bg-espresso/5"
              >
                {label}
              </button>
            ))}
            <div className="mt-2 flex gap-2 px-2 pb-2">
              <a data-testid="nav-mobile-call" href={PHONE_TEL} className="flex-1 rounded-full border border-espresso/20 py-3 text-center font-btn text-sm font-semibold text-espresso">Call Now</a>
              <a data-testid="nav-mobile-whatsapp" href={waLink("Hello M M Good Choice Furniture! I'd like to enquire.")} target="_blank" rel="noreferrer" className="flex-1 rounded-full bg-espresso py-3 text-center font-btn text-sm font-semibold text-cream">WhatsApp</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
