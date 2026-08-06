import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { scrollToId } from "./Extras";
import { PHONE_DISPLAY, PHONE_TEL, waLink } from "../lib/api";

export default function Footer({ settings }) {
  return (
    <footer data-testid="site-footer" className="noise-overlay relative bg-espresso text-cream">
      <div className="mx-auto w-[min(1240px,94%)] py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/40 bg-cream/5 font-display text-base font-extrabold text-gradient-gold">MM</span>
              <div className="leading-tight">
                <p className="font-display text-lg font-extrabold tracking-tight">M M GOOD CHOICE</p>
                <p className="text-[10px] font-btn font-semibold tracking-[0.4em] text-gold">FURNITURE</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
              Premium wooden furniture crafted for beautiful homes. Serving TC Palya, Krishnarajapuram and greater Bengaluru for over a decade.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="font-btn text-xs font-semibold tracking-[0.3em] uppercase text-gold">Explore</p>
            <ul className="mt-5 space-y-3">
              {[["collections", "Collections"], ["gallery", "Gallery"], ["why-us", "Why Choose Us"], ["testimonials", "Customer Stories"], ["contact", "Contact"]].map(([id, label]) => (
                <li key={id}>
                  <button data-testid={`footer-link-${id}`} onClick={() => scrollToId(id)} className="text-sm text-cream/70 transition-colors duration-300 hover:text-gold">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="font-btn text-xs font-semibold tracking-[0.3em] uppercase text-gold">Reach Us</p>
            <ul className="mt-5 space-y-3 text-sm text-cream/70">
              <li>
                <a data-testid="footer-phone" href={PHONE_TEL} className="flex items-center gap-2.5 transition-colors hover:text-gold">
                  <Phone size={15} className="text-gold" /> {settings?.phone || PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a data-testid="footer-whatsapp" href={waLink("Hello M M Good Choice Furniture!")} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 transition-colors hover:text-gold">
                  <MessageCircle size={15} className="text-gold" /> WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                <span>{settings?.address || "Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={15} className="text-gold" /> {settings?.hours || "Open Daily · Till 7:30 PM"}
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-cream/10 pt-7">
          <p className="text-xs text-cream/50">© {new Date().getFullYear()} M M Good Choice Furniture. All rights reserved.</p>
          <Link data-testid="footer-owner-link" to="/owner" className="text-xs text-cream/30 transition-colors duration-300 hover:text-gold">
            Owner Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
