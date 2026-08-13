// HorizontalGallery: galería horizontal con pin de scroll (GSAP ScrollTrigger),
// réplica del demo "Horizontal scrolling gallery" de GSAP: la sección queda
// fijada al viewport mientras el strip de paneles se traslada en X de forma
// ligada al scroll (scrub). Prop 'items' define los paneles.
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface GalleryPanel {
  id: string;
  tagline: string;
  title: string;
  description: string;
  glyph: string;
  accent: string;
  ctaLabel: string;
  href: string;
  features: { title: string; description: string }[];
}

interface Props {
  items: GalleryPanel[];
}

export default function HorizontalGallery({ items }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const strip = stripRef.current;
    if (!wrapper || !strip || strip.scrollWidth === 0) return;

    const tween = gsap.to(strip, {
      x: () => -(strip.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        pin: wrapper,
        start: "center center",
        end: () => "+=" + strip.scrollWidth,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [items]);

  return (
    <section className="relative overflow-hidden">
      <div ref={wrapperRef} data-hgal="wrapper" className="relative flex flex-nowrap will-change-transform">
        <div ref={stripRef} data-hgal="strip" className="flex flex-nowrap will-change-transform">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="flex w-[88vw] shrink-0 box-content p-4 sm:w-[60vw] sm:p-6 lg:w-[33vw] lg:p-8"
            >
              <a
                href={item.href}
                className={`group flex h-auto min-h-[60vh] w-full flex-col gap-6 rounded-3xl border border-white/5 bg-gradient-to-br to-transparent p-8 transition-all duration-300 hover:border-white/15 hover:bg-ink-soft/60 sm:gap-8 sm:p-10 lg:min-h-[70vh] ${item.accent}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="kicker !text-cream/40">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-lg text-cream/80 transition-colors duration-300 group-hover:border-vortex/60 group-hover:text-vortex">
                    {item.glyph}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="kicker text-cream/50">{item.tagline}</p>
                  <h3 className="text-3xl leading-tight font-light text-white lg:text-4xl xl:text-5xl">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-cream/60">{item.description}</p>

                <ul className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-5">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-4">
                      <span className="mt-0.5 font-mono text-[10px] tracking-widest text-cream/30">
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-cream/80">{feature.title}</span>
                        <span className="text-xs leading-relaxed text-cream/40">
                          {feature.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <span className="kicker flex items-center gap-2 text-cream/50 transition-colors duration-300 group-hover:text-vortex">
                  {item.ctaLabel} →
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}