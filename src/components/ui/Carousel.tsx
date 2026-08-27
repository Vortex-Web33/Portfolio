// Carousel: carrusel de testimonios estilo coverflow 3D con GSAP — loop infinito, auto-advance, swipe, dots.
import * as React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type CarouselItem = {
  quote: string;
  author: string;
  role: string;
  avatar: string;
};

export type CarouselProps = {
  items: CarouselItem[];
  initialIndex?: number;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
  showDots?: boolean;
  className?: string;
  onChangeIndex?: (index: number, item: CarouselItem) => void;
};

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

export function Carousel({
  items,
  initialIndex = 0,
  autoAdvance = false,
  intervalMs = 4000,
  pauseOnHover = true,
  showDots = true,
  className,
  onChangeIndex,
}: CarouselProps) {
  const len = items.length;
  const [active, setActive] = useState(() => wrapIndex(initialIndex, len));
  const [hovering, setHovering] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<number, HTMLDivElement>());
  const entered = useRef(new Set<number>());
  const suppressClick = useRef(false);
  const rafId = useRef<number>();

  useEffect(() => {
    setActive((a) => wrapIndex(a, len));
  }, [len]);

  useEffect(() => {
    if (!len) return;
    onChangeIndex?.(active, items[active]!);
  }, [active, items, len]);

  // responsive card width
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? el.clientWidth);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const cardWidth = 380;
  const gap = 32;
  const step = cardWidth + gap;

  const canGoPrev = true;
  const canGoNext = true;

  const prev = useCallback(() => {
    if (!len) return;
    setActive((a) => wrapIndex(a - 1, len));
  }, [len]);

  const next = useCallback(() => {
    if (!len) return;
    setActive((a) => wrapIndex(a + 1, len));
  }, [len]);

  // GSAP: animate cards to coverflow positions
  useLayoutEffect(() => {
    const tweens: gsap.core.Tween[] = [];
    const track = trackRef.current;
    if (!track) return;

    // center the active card
    const centerOffset = (containerWidth - cardWidth) / 2;
    const activeX = centerOffset - active * step;

    // animate track
    gsap.to(track, {
      x: activeX,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto",
    });

    // animate individual cards for 3D coverflow effect
    items.forEach((_, i) => {
      const cardEl = cardRefs.current.get(i);
      if (!cardEl) return;

      const offset = i - active;
      const absOffset = Math.abs(offset);
      const isActive = offset === 0;

      // 3D transform: scale, rotateY, z, opacity based on distance from center
      const scale = isActive ? 1.15 : Math.max(0.75, 1 - absOffset * 0.12);
      const rotateY = offset * 18; // degrees
      const z = isActive ? 0 : -absOffset * 120;
      const opacity = isActive ? 1 : Math.max(0.4, 1 - absOffset * 0.15);
      const filter = isActive ? "none" : `blur(${absOffset * 1.5}px)`;

      if (!entered.current.has(i)) {
        entered.current.add(i);
        tweens.push(
          gsap.fromTo(
            cardEl,
            {
              scale: scale * 0.9,
              rotateY: rotateY * 1.5,
              z: z - 50,
              opacity: 0,
              filter: `blur(8px)`,
            },
            {
              scale,
              rotateY,
              z,
              opacity,
              filter,
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
            },
          ),
        );
      } else {
        tweens.push(
          gsap.to(cardEl, {
            scale,
            rotateY,
            z,
            opacity,
            filter,
            duration: 0.7,
            ease: "power3.out",
            overwrite: "auto",
          }),
        );
      }
    });

    return () => tweens.forEach((tween) => tween.kill());
  }, [active, containerWidth, items, len]);

  // drag/swipe on track
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const threshold = 60;
    let dragging = false;
    let startX = 0;
    let travel = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, a")) return;
      dragging = true;
      startX = e.clientX;
      travel = 0;
      el.setPointerCapture(e.pointerId);
      gsap.killTweensOf(el, "x");
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      travel = e.clientX - startX;
      // elastic drag on track
      const currentX = -active * step + (containerWidth - cardWidth) / 2;
      gsap.set(el, { x: currentX + travel * 0.4 });
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (travel > threshold) prev();
      else if (travel < -threshold) next();
      // snap back handled by layout effect
      travel = 0;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [active, containerWidth, len, prev, next]);

  // autoplay
  useEffect(() => {
    if (!autoAdvance) return;
    if (!len) return;
    if (pauseOnHover && hovering) return;

    const id = window.setInterval(() => {
      next();
    }, Math.max(700, intervalMs));

    return () => window.clearInterval(id);
  }, [autoAdvance, intervalMs, hovering, pauseOnHover, len, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (!len) return null;

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        ref={stageRef}
        className="relative overflow-hidden"
        style={{ height: 420, perspective: "1200px" }}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* gradient overlays on sides */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-ink via-ink/80 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/4 bg-gradient-to-l from-ink via-ink/80 to-transparent"
          aria-hidden="true"
        />

        <div
          ref={trackRef}
          className="absolute top-0 left-0 flex h-full items-center gap-[32px] will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardRefs.current.set(i, el);
              }}
              className="flex-shrink-0 w-[380px]"
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform, opacity, filter",
              }}
            >
              <TestimonialCard item={item} active={i === active} />
            </div>
          ))}
        </div>
      </div>

      {showDots && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {items.map((_, idx) => {
            const on = idx === active;
            return (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  on ? "w-8 bg-vortex" : "bg-white/30 hover:bg-white/50",
                )}
                aria-label={`Ir a testimonio ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({
  item,
  active,
}: {
  item: CarouselItem;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-ink-soft/30 p-8 text-center transition-all duration-500",
        active
          ? "border-vortex/50 shadow-[0_0_60px_rgba(188,128,187,0.2)]"
          : "",
      )}
      style={{
        backfaceVisibility: "hidden" as const,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative size-18 shrink-0 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
        <img
          src={item.avatar}
          alt={item.author}
          className="h-full w-full object-cover transition-transform duration-500"
          loading="lazy"
          style={active ? { transform: "scale(1.05)" } : {}}
        />
        {active && (
          <div className="absolute inset-0 bg-gradient-to-br from-vortex/20 to-vortex-green/20 pointer-events-none" />
        )}
      </div>

      <blockquote className="text-cream/90">
        <p className="text-base md:text-lg font-medium leading-relaxed">"{item.quote}"</p>
      </blockquote>

      <div className="space-y-1 pt-4 border-t border-white/5 w-full">
        <cite className="not-italic font-semibold text-white">
          {item.author}
        </cite>
        <p className="font-mono text-xs text-cream/50 uppercase tracking-wide">
          {item.role}
        </p>
      </div>
    </div>
  );
}