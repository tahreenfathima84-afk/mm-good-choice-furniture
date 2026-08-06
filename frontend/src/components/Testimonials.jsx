import { Star } from "lucide-react";
import { SectionHeading, Reveal } from "./Extras";
import { TESTIMONIALS } from "../lib/content";

export default function Testimonials() {
  return (
    <section id="testimonials" data-testid="testimonials-section" className="noise-overlay relative bg-sand py-24 md:py-32">
      <div className="mx-auto w-[min(1240px,94%)]">
        <SectionHeading label="Customer Stories" title={<>Loved by Bengaluru<br />families.</>} align="center" />
        <div className="mt-16 grid gap-7 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 0.12}>
              <figure
                data-testid={`testimonial-${i}`}
                className="flex h-full flex-col rounded-3xl bg-cream p-8 shadow-luxury transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-lift sm:p-10"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-inksoft">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4 border-t border-ink/8 pt-6">
                  <img src={t.photo} alt={t.name} loading="lazy" className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/40" />
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs font-semibold tracking-wide text-copper">{t.area}, Bengaluru</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
