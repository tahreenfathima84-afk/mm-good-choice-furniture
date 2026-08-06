import Marquee from "react-fast-marquee";
import { MARQUEE_ITEMS } from "../lib/content";

export default function EditorialMarquee() {
  return (
    <div data-testid="editorial-marquee" className="border-y border-ink/8 bg-cream py-6 overflow-hidden">
      <Marquee speed={28} gradient={false} pauseOnHover>
        {MARQUEE_ITEMS.map((item) => (
          <span key={item} className="mx-8 flex items-center gap-8">
            <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink/15 whitespace-nowrap">
              {item}
            </span>
            <span className="h-2 w-2 rounded-full bg-gold/50" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
