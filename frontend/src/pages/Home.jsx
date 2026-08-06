import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import LoadingScreen from "../components/LoadingScreen";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EditorialMarquee from "../components/Marquee";
import Collections from "../components/Collections";
import Gallery from "../components/Gallery";
import Manifesto from "../components/Manifesto";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { MouseGlow, BackToTop } from "../components/Extras";
import { api } from "../lib/api";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
    const t = setTimeout(() => setLoading(false), 2500);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null; clearTimeout(t); };
  }, []);

  return (
    <div className="bg-sand">
      <AnimatePresence>{loading && <LoadingScreen key="loader" />}</AnimatePresence>
      <MouseGlow />
      <AnimatePresence>
        {!loading && settings?.offer_enabled && settings?.offer_text && (
          <motion.div
            data-testid="offer-banner"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-copper via-gold to-copper py-1.5 text-center"
          >
            <p className="font-btn text-[11px] font-semibold tracking-[0.15em] uppercase text-espresso">{settings.offer_text}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar />
      <main>
        <Hero settings={settings} />
        <EditorialMarquee />
        <Collections />
        <Manifesto />
        <Gallery />
        <Testimonials />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
      <BackToTop />
    </div>
  );
}
