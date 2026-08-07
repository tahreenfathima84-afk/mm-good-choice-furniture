import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { EASE } from "./Extras";

const WA_FLOAT =
  "https://wa.me/919110690642?text=Hello%20M%20M%20Good%20Choice%20Furniture,%20I%20would%20like%20to%20know%20more%20about%20your%20furniture.";

export default function FloatingWhatsApp() {
  return (
    <motion.a
      data-testid="floating-whatsapp-button"
      href={WA_FLOAT}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 2.8, ease: EASE }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-olive text-cream shadow-luxury glow-gold transition-colors duration-300 hover:bg-copper p-4 sm:px-6 sm:py-4"
    >
      <MessageCircle size={20} className="shrink-0" />
      <span className="hidden sm:inline font-btn text-sm font-semibold tracking-wide">WhatsApp Us</span>
      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-gold animate-pulse-soft" aria-hidden="true" />
    </motion.a>
  );
}
