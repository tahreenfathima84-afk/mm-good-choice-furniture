import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Phone, MessageCircle, MapPin, Navigation, ChevronDown } from "lucide-react";
import { Magnetic, Particles, scrollToId, EASE } from "./Extras";
import { IMAGES } from "../lib/content";
import { PHONE_TEL, waLink, MAPS_DIRECTIONS } from "../lib/api";

function MaskedLine({ children, delay }) {
  return (
    <span className="masked-line">
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero({ settings }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="home" data-testid="hero-section" className="relative flex min-h-[100svh] items-end overflow-hidden bg-espresso">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Luxury Indian living room with premium wooden furniture"
          className="h-full w-full scale-110 object-cover animate-hero-zoom"
          fetchpriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/45 to-espresso/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/60 via-transparent to-transparent" />
      <Particles count={16} dark />

      <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 mx-auto w-[min(1240px,94%)] pb-24 pt-40 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mb-6 inline-flex items-center gap-3 rounded-full glass-dark px-5 py-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-soft" />
          <span className="font-btn text-xs font-semibold tracking-[0.3em] uppercase text-cream/90">
            Bengaluru · 10+ Years of Craft
          </span>
        </motion.div>

        <h1 className="font-display font-extrabold leading-[0.92] tracking-tighter text-cream text-[50px] md:text-[70px] lg:text-[100px] xl:text-[118px]">
          <MaskedLine delay={0.45}>M M GOOD CHOICE</MaskedLine>
          <MaskedLine delay={0.62}>
            <span className="text-gradient-gold">FURNITURE</span>
          </MaskedLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: EASE }}
          className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-cream/85"
        >
          {settings?.hero_subtitle || "Premium Wooden Furniture Crafted for Beautiful Homes."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnetic>
            <button
              data-testid="hero-explore-button"
              onClick={() => scrollToId("collections")}
              className="rounded-full bg-cream px-8 py-4 font-btn text-sm font-semibold tracking-wide text-espresso shadow-luxury transition-colors duration-300 hover:bg-gold"
            >
              Explore Collection
            </button>
          </Magnetic>
          <Magnetic>
            <a
              data-testid="hero-whatsapp-button"
              href={waLink("Hello M M Good Choice Furniture! I visited your website and I'd like to explore your collection.")}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-olive px-8 py-4 font-btn text-sm font-semibold tracking-wide text-cream shadow-luxury transition-colors duration-300 hover:bg-copper"
            >
              <MessageCircle size={17} /> WhatsApp
            </a>
          </Magnetic>
          <div className="flex flex-wrap items-center gap-5 sm:ml-3">
            <a data-testid="hero-call-button" href={PHONE_TEL} className="group flex items-center gap-2 font-btn text-sm font-semibold text-cream/90 transition-colors duration-300 hover:text-gold">
              <Phone size={16} className="text-gold" /> Call Now
            </a>
            <button data-testid="hero-visit-button" onClick={() => scrollToId("contact")} className="group flex items-center gap-2 font-btn text-sm font-semibold text-cream/90 transition-colors duration-300 hover:text-gold">
              <MapPin size={16} className="text-gold" /> Visit Showroom
            </button>
            <a data-testid="hero-directions-button" href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="group flex items-center gap-2 font-btn text-sm font-semibold text-cream/90 transition-colors duration-300 hover:text-gold">
              <Navigation size={16} className="text-gold" /> Get Directions
            </a>
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        data-testid="hero-scroll-indicator"
        onClick={() => scrollToId("collections")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream/70 transition-colors hover:text-gold"
        aria-label="Scroll down"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={26} />
        </motion.div>
      </motion.button>
    </section>
  );
}
