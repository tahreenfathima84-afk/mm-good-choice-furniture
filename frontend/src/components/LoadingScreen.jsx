import { motion } from "framer-motion";
import { Particles, EASE } from "./Extras";

export default function LoadingScreen() {
  return (
    <motion.div
      data-testid="loading-screen"
      className="fixed inset-0 z-[100] grid place-items-center bg-espresso noise-overlay"
      exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
    >
      <Particles count={18} dark />
      <div className="relative text-center px-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-3xl border border-gold/40 bg-cream/5 backdrop-blur-xl glow-gold"
        >
          <span className="font-display text-4xl font-extrabold tracking-tighter text-gradient-gold">MM</span>
        </motion.div>
        <div className="masked-line">
          <motion.p
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="font-display text-2xl sm:text-3xl font-extrabold tracking-[0.18em] text-cream"
          >
            M M GOOD CHOICE
          </motion.p>
        </div>
        <div className="masked-line mt-1">
          <motion.p
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
            className="font-btn text-sm font-semibold tracking-[0.5em] text-gold"
          >
            FURNITURE
          </motion.p>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 0.7, ease: EASE }}
          className="mx-auto mt-8 h-px w-48 origin-left bg-gradient-to-r from-transparent via-gold to-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-4 text-xs tracking-[0.25em] uppercase text-cream/50"
        >
          Crafted for Beautiful Homes
        </motion.p>
      </div>
    </motion.div>
  );
}
