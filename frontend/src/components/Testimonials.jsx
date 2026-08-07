import { Star, Quote, BadgeCheck } from "lucide-react";
import { SectionHeading, Reveal } from "./Extras";
import { TESTIMONIALS } from "../lib/content";

const initials = (name) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function Testimonials() {
  return (
    <section id="testimonials" data-testid="testimonials-section" className="noise-overlay relative bg-sand py-24 md:py-32">
      <div className="mx-auto w-[min(1240px,94%)]">
        <SectionHeading label="Customer Stories" title={<>Loved by Bengaluru<br />families.</>} align="center" />
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.1}>
              <figure
                data-testid={`testimonial-${i}`}
                className="flex h-full flex-col rounded-3xl bg-cream p-7 shadow-luxury transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={14} className={s < t.rating ? "fill-gold text-gold" : "text-stone"} />
                    ))}
                  </div>
                  <Quote size={22} className="text-copper/25" />
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-inksoft">
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5 border-t border-ink/8 pt-5">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${t.color} font-display text-sm font-bold text-cream`}>
                    {initials(t.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
                      {t.name}
                      {t.verified && <BadgeCheck size={14} className="text-olive" aria-label="Verified review" />}
                    </p>
                    <p className="truncate text-xs font-semibold text-mutedwarm">{t.area}, Bengaluru · {t.purchase}</p>
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
