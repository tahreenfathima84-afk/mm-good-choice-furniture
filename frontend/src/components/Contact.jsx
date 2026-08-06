import { useEffect, useState } from "react";
import { Phone, MessageCircle, Navigation, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading, Reveal, Magnetic } from "./Extras";
import { api, PHONE_DISPLAY, PHONE_TEL, waLink, MAPS_DIRECTIONS, MAPS_EMBED } from "../lib/api";

export default function Contact({ settings }) {
  const [form, setForm] = useState({ name: "", phone: "", product: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const onQuote = (e) => setForm((f) => ({ ...f, product: e.detail, message: `I'd like a quote for the ${e.detail}.` }));
    window.addEventListener("quote-product", onQuote);
    return () => window.removeEventListener("quote-product", onQuote);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("Please fill your name, phone and message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/enquiries", form);
      toast.success("Thank you! We'll call you back shortly.");
      setForm({ name: "", phone: "", product: "", message: "" });
    } catch {
      toast.error("Could not send your enquiry. Please try WhatsApp instead.");
    } finally {
      setSending(false);
    }
  };

  const address = settings?.address || "Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036";
  const hours = settings?.hours || "Open Daily · Till 7:30 PM";

  return (
    <section id="contact" data-testid="contact-section" className="noise-overlay relative bg-stone/60 py-24 md:py-32">
      <div className="mx-auto w-[min(1240px,94%)]">
        <SectionHeading label="Visit or Reach Us" title={<>Your home's next<br />chapter starts here.</>} />

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <a data-testid="contact-phone-link" href={PHONE_TEL} className="font-display text-3xl font-extrabold tracking-tight text-espresso transition-colors hover:text-copper sm:text-4xl">
                {settings?.phone || PHONE_DISPLAY}
              </a>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6 space-y-4 text-base text-inksoft">
                <p className="flex items-start gap-3">
                  <MapPin size={19} className="mt-0.5 shrink-0 text-copper" />
                  <span data-testid="contact-address">{address}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Clock size={19} className="shrink-0 text-copper" />
                  <span data-testid="contact-hours">{hours}</span>
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic strength={0.2}>
                  <a data-testid="contact-call-button" href={PHONE_TEL} className="flex items-center gap-2 rounded-full bg-espresso px-7 py-3.5 font-btn text-sm font-semibold text-cream transition-colors duration-300 hover:bg-copper">
                    <Phone size={16} /> Call Now
                  </a>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a data-testid="contact-whatsapp-button" href={waLink("Hello M M Good Choice Furniture! I'd like to make an enquiry.")} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-olive px-7 py-3.5 font-btn text-sm font-semibold text-cream transition-colors duration-300 hover:bg-copper">
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a data-testid="contact-directions-button" href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border-2 border-espresso/20 px-7 py-3.5 font-btn text-sm font-semibold text-espresso transition-colors duration-300 hover:border-copper hover:text-copper">
                    <Navigation size={16} /> Get Directions
                  </a>
                </Magnetic>
              </div>
            </Reveal>
            <Reveal delay={0.22} className="mt-10">
              <div className="overflow-hidden rounded-3xl shadow-luxury">
                <iframe
                  data-testid="contact-map"
                  title="M M Good Choice Furniture location"
                  src={MAPS_EMBED}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <form data-testid="contact-form" onSubmit={submit} className="glass rounded-3xl p-8 sm:p-10">
              <h3 className="font-display text-2xl font-bold tracking-tight text-ink">Request a Quote</h3>
              <p className="mt-2 text-sm text-inksoft">Tell us what you're looking for — we usually respond within the hour.</p>
              <div className="mt-7 space-y-5">
                <div>
                  <label htmlFor="cf-name" className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Your Name</label>
                  <input id="cf-name" data-testid="contact-name-input" value={form.name} onChange={set("name")} placeholder="e.g. Priya Sharma" className="w-full rounded-2xl border border-ink/10 bg-cream px-5 py-3.5 text-sm text-ink outline-none transition-colors duration-300 placeholder:text-mutedwarm focus:border-copper" />
                </div>
                <div>
                  <label htmlFor="cf-phone" className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Phone Number</label>
                  <input id="cf-phone" data-testid="contact-phone-input" value={form.phone} onChange={set("phone")} placeholder="+91 ..." className="w-full rounded-2xl border border-ink/10 bg-cream px-5 py-3.5 text-sm text-ink outline-none transition-colors duration-300 placeholder:text-mutedwarm focus:border-copper" />
                </div>
                <div>
                  <label htmlFor="cf-product" className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Interested In (optional)</label>
                  <input id="cf-product" data-testid="contact-product-input" value={form.product} onChange={set("product")} placeholder="e.g. Luxury Sofa, King Bed..." className="w-full rounded-2xl border border-ink/10 bg-cream px-5 py-3.5 text-sm text-ink outline-none transition-colors duration-300 placeholder:text-mutedwarm focus:border-copper" />
                </div>
                <div>
                  <label htmlFor="cf-message" className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Message</label>
                  <textarea id="cf-message" data-testid="contact-message-input" value={form.message} onChange={set("message")} rows={4} placeholder="Tell us about your space and what you need..." className="w-full resize-none rounded-2xl border border-ink/10 bg-cream px-5 py-3.5 text-sm text-ink outline-none transition-colors duration-300 placeholder:text-mutedwarm focus:border-copper" />
                </div>
                <Magnetic strength={0.15} className="w-full">
                  <button
                    data-testid="contact-submit-button"
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-4 font-btn text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-copper disabled:opacity-60"
                  >
                    <Send size={16} /> {sending ? "Sending..." : "Send Enquiry"}
                  </button>
                </Magnetic>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
