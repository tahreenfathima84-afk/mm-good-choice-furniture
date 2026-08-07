import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useInView, animate } from "framer-motion";
import { ArrowUp } from "lucide-react";

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90 });
  else el.scrollIntoView({ behavior: "smooth" });
};

export const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, y = 40, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ label, title, align = "left", dark = false }) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <Reveal>
        <span className={`inline-block text-xs font-btn font-semibold tracking-[0.3em] uppercase ${dark ? "text-gold" : "text-copper"}`}>
          {label}
        </span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className={`mt-4 font-display font-extrabold tracking-tighter text-4xl sm:text-5xl lg:text-6xl leading-[1.02] ${dark ? "text-cream" : "text-ink"}`}>
          {title}
        </h2>
      </Reveal>
    </div>
  );
}

export function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14 });
  const sy = useSpring(y, { stiffness: 180, damping: 14 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}

export function Particles({ count = 14, dark = false }) {
  const dots = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 13) % 100}%`,
      top: `${(i * 53 + 7) % 100}%`,
      size: 3 + ((i * 7) % 5),
      delay: (i % 6) * 0.9,
      slow: i % 2 === 0,
    }))
  ).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className={`absolute rounded-full ${d.slow ? "animate-float-slow" : "animate-float-slower"} ${dark ? "bg-gold/40" : "bg-copper/30"}`}
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, animationDelay: `${d.delay}s` }}
        />
      ))}
    </div>
  );
}

export function MouseGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const move = (e) => { x.set(e.clientX - 250); y.set(e.clientY - 250); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-30 h-[500px] w-[500px] rounded-full opacity-40 mix-blend-multiply"
      style={{
        left: 0, top: 0, x: sx, y: sy,
        background: "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(184,115,51,0.12) 40%, transparent 70%)",
      }}
    />
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.button
      data-testid="back-to-top-button"
      aria-label="Back to top"
      onClick={() => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20, pointerEvents: show ? "auto" : "none" }}
      transition={{ duration: 0.4, ease: EASE }}
      className="fixed bottom-24 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-espresso text-cream shadow-luxury hover:bg-copper transition-colors duration-300"
    >
      <ArrowUp size={20} />
    </motion.button>
  );
}

export function Counter({ value, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
