// HorizontalGallery: galería premium con scroll horizontal en desktop (pin + scrub)
// y stack vertical usable en móvil. Demo GSAP "Horizontal scrolling gallery" mejorada.
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
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const strip = stripRef.current;
    const progress = progressRef.current;
    if (!wrapper || !strip) return;

    const mm = gsap.matchMedia();

    // Desktop: pin + horizontal scrub
    mm.add("(min-width: 768px)", () => {
      if (strip.scrollWidth === 0) return;

      const lead = (): number => {
        const first = strip.children[0] as HTMLElement | undefined;
        const panelWidth = first?.offsetWidth ?? 0;
        return Math.max(0, Math.round(window.innerWidth * 0.38 - panelWidth / 2));
      };

      const tween = gsap.fromTo(
        strip,
        { x: () => lead() },
        {
          x: () => -(strip.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            pin: wrapper,
            start: "center center",
            end: () => "+=" + (strip.scrollWidth + lead()),
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progress) gsap.set(progress, { scaleX: self.progress });
            },
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    // Mobile: no pin, just natural vertical flow — ensure ScrollTrigger refresh for Lenis
    mm.add("(max-width: 767px)", () => {
      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, [items]);

  return (
    <section className="relative overflow-hidden">
      {/* Progress bar (desktop only) */}
      <div className="pointer-events-none absolute top-0 inset-x-0 z-20 hidden md:block h-[2px] bg-white/5">
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-gradient-to-r from-vortex to-vortex-green"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <div
        ref={wrapperRef}
        data-hgal="wrapper"
        className="relative flex flex-col md:flex-row md:flex-nowrap will-change-transform"
      >
        <div
          ref={stripRef}
          data-hgal="strip"
          className="flex flex-col md:flex-row md:flex-nowrap gap-6 px-6 py-8 md:gap-0 md:px-0 md:py-0 md:will-change-transform"
        >
          {items.map((item, i) => (
            <article
              key={item.id}
              className="flex w-full shrink-0 box-content md:w-[78vw] md:p-4 lg:w-[38vw] lg:p-6 xl:w-[32vw]"
            >
              <a
                href={item.href}
                className={`group relative flex h-auto min-h-[520px] w-full flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-ink-soft/40 backdrop-blur-xl p-7 md:p-8 lg:p-9 transition-all duration-500 hover:border-white/15 hover:bg-ink-soft/60 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] hover:-translate-y-1.5 bg-gradient-to-br ${item.accent} to-transparent`}
              >
                {/* Top accent line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-60 group-hover:via-white/25 transition-all" />

                {/* Header */}
                <div className="flex items-start justify-between gap-6">
                  <span className="kicker !text-cream/35 tracking-[0.25em]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex size-12 md:size-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] font-mono text-lg md:text-xl text-white/90 shadow-inner backdrop-blur-sm transition-all duration-500 group-hover:bg-vortex/15 group-hover:border-vortex/30 group-hover:text-white group-hover:scale-105 group-hover:rotate-3">
                    {item.glyph}
                  </span>
                </div>

                {/* Title block */}
                <div className="mt-6 md:mt-8 flex flex-col gap-3">
                  <p className="kicker !text-[10px] tracking-[0.2em] text-vortex/80 md:text-cream/45 group-hover:text-vortex transition-colors">{item.tagline}</p>
                  <h3 className="text-balance text-3xl md:text-4xl lg:text-[42px] font-bold leading-[0.95] tracking-tight text-white">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-4 md:mt-5 text-[15px] md:text-[15.5px] leading-relaxed text-cream/65 text-pretty">
                  {item.description}
                </p>

                {/* Features */}
                <ul className="mt-6 md:mt-8 flex flex-col gap-3.5 border-t border-white/[0.06] pt-6 group-hover:border-white/[0.09] transition-colors">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3.5 group/item">
                      <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06] font-mono text-[9px] font-medium tracking-widest text-cream/40 group-hover/item:bg-vortex/10 group-hover/item:border-vortex/20 group-hover/item:text-vortex/80 transition-colors">
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-semibold tracking-tight text-white/90 group-hover/item:text-white transition-colors">
                          {feature.title}
                        </span>
                        <span className="text-[13px] md:text-xs leading-relaxed text-cream/45 text-pretty">
                          {feature.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <span className="kicker mt-auto pt-6 md:pt-8 flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/60 group-hover:text-vortex group-hover:gap-3 transition-all duration-300">
                  {item.ctaLabel}
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white/80 group-hover:bg-vortex group-hover:border-vortex group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>

      {/* Mobile hint */}
      <div className="flex justify-center md:hidden px-6 pb-4">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase">Desliza vertical • Toca para ver</span>
      </div>
    </section>
  );
}
