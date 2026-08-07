import { SectionHeading, Reveal, Counter } from "./Extras";
import { MANIFESTO, STATS, IMAGES } from "../lib/content";

export default function Manifesto() {
  return (
    <section id="why-us" data-testid="why-us-section" className="noise-overlay relative bg-cream py-24 md:py-32">
      <span id="about" className="absolute -top-20" aria-hidden="true" />
      <div className="mx-auto w-[min(1240px,94%)]">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading label="Why Choose Us" title={<>A decade of<br />quiet excellence.</>} />
              <Reveal delay={0.2}>
                <p className="mt-6 max-w-md text-base leading-relaxed text-inksoft">
                  Eight promises, kept daily since our first showroom in Thambuchetty Palya. This is why Bengaluru families come back — and bring their neighbours.
                </p>
              </Reveal>
              <Reveal delay={0.3} className="mt-10">
                <div className="relative overflow-hidden rounded-3xl shadow-luxury">
                  <img src={IMAGES.craft} alt="Craftsmanship at M M Good Choice Furniture" loading="lazy" className="h-72 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
                  <p className="absolute bottom-5 left-6 font-display text-lg font-bold text-cream">Crafted, not manufactured.</p>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            {MANIFESTO.map((m, i) => (
              <Reveal key={m.num} delay={i * 0.05} y={26}>
                <div data-testid={`manifesto-chapter-${m.num}`} className="group flex gap-6 border-t border-ink/10 py-7 transition-colors duration-500 hover:bg-sand/60 sm:gap-10 sm:px-4">
                  <span className="font-display text-3xl font-extrabold tracking-tighter text-gold/70 transition-colors duration-500 group-hover:text-copper sm:text-4xl">
                    {m.num}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{m.title}</h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-inksoft">{m.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div data-testid={`stat-${s.label.replace(/\s+/g, "-").toLowerCase()}`} className="rounded-3xl bg-espresso p-8 text-center shadow-luxury transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-lift sm:p-10">
                <p className="font-display text-4xl font-extrabold tracking-tighter text-gradient-gold sm:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 font-btn text-xs font-semibold tracking-[0.2em] uppercase text-cream/70">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
