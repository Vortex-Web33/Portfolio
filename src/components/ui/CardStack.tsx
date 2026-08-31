// CardStack: mazo de tarjetas en abanico (fan 3D) replicado con GSAP — geometría de
// solapamiento/giró/translación-Z, entrada animada, auto-advance con pause-on-hover,
// drag elástico con swipe por umbral/velocidad, navegación por teclado y dots.
import * as React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type CardStackItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc?: string;
  href?: string;
  ctaLabel?: string;
  tag?: string;
};

export type CardStackProps<T extends CardStackItem> = {
  items: T[];

  /** Selected index on mount */
  initialIndex?: number;

  /** How many cards are visible around the active (odd recommended) */
  maxVisible?: number;

  /** Card sizing */
  cardWidth?: number;
  cardHeight?: number;

  /** How much cards overlap each other (0..0.8). Higher = more overlap */
  overlap?: number;

  /** Total fan angle (deg). Higher = wider arc */
  spreadDeg?: number;

  /** 3D / depth feel */
  perspectivePx?: number;
  depthPx?: number;
  tiltXDeg?: number;

  /** Active emphasis */
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;

  /** Reduce 3D tilt on inactive cards to avoid blur */
  reduceInactiveTilt?: boolean;

  /** Motion */
  springStiffness?: number;
  springDamping?: number;

  /** Behavior */
  loop?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;

  /** UI */
  showDots?: boolean;
  className?: string;

  /** Hooks */
  onChangeIndex?: (index: number, item: T) => void;
};

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

/** Minimal signed offset from active index to i, with wrapping (for loop behavior). */
function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;

  // consider wrapped alternative
  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

type FanLayout = {
  x: number;
  y: number;
  z: number;
  rotateZ: number;
  rotateX: number;
  scale: number;
};

export function CardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 7,

  cardWidth = 520,
  cardHeight = 320,

  overlap = 0.48,
  spreadDeg = 48,

  perspectivePx = 1100,
  depthPx = 140,
  tiltXDeg = 12,

  activeLiftPx = 22,
  activeScale = 1.03,
  inactiveScale = 0.94,

  reduceInactiveTilt = true,

  springStiffness = 280,
  springDamping = 28,

  loop = true,
  autoAdvance = false,
  intervalMs = 2800,
  pauseOnHover = true,

  showDots = true,
  className,

  onChangeIndex,
}: CardStackProps<T>) {
  const len = items.length;

  const [active, setActive] = useState(() => wrapIndex(initialIndex, len));
  const [hovering, setHovering] = useState(false);
  const [containerW, setContainerW] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string | number, HTMLDivElement>());
  const entered = useRef(new Set<string | number>());
  const suppressClick = useRef(false);

  // keep active in bounds if items change
  useEffect(() => {
    setActive((a) => wrapIndex(a, len));
  }, [len]);

  useEffect(() => {
    if (!len) return;
    onChangeIndex?.(active, items[active]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const isMobile = containerW > 0 && containerW < 640;
  const effectiveMaxVisible = isMobile ? 3 : maxVisible;
  const effectiveSpreadDeg = isMobile ? 14 : spreadDeg;
  const effectiveOverlap = isMobile ? 0.18 : overlap;
  const effectiveDepthPx = isMobile ? 0 : depthPx;
  const maxOffset = Math.max(0, Math.floor(effectiveMaxVisible / 2));

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      setContainerW(width);
    });
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Mobile: cards fill width with safe padding; desktop: scale fan to fit
  const fit = Math.min(1, (containerW || cardWidth) / cardWidth);
  const w = isMobile
    ? Math.max(280, Math.min(cardWidth, containerW - 32))
    : Math.max(240, Math.round(cardWidth * fit));
  const h = isMobile
    ? Math.max(340, Math.round(w * (cardHeight / cardWidth)))
    : Math.max(160, Math.round(cardHeight * fit));

  // natural spacing shrinks the fan to always fit the available width (no edge clipping)
  const naturalSpacing = Math.round(w * (1 - effectiveOverlap));
  const roomForFan =
    containerW > w ? (containerW - w) / (2 * Math.max(1, maxOffset)) : 0;
  const cardSpacing =
    containerW > 0 && roomForFan < naturalSpacing
      ? Math.max(isMobile ? 16 : 8, Math.round(roomForFan))
      : naturalSpacing;

  const stepDeg = maxOffset > 0 ? effectiveSpreadDeg / maxOffset : 0;
  const fitDepth = Math.round(effectiveDepthPx * (isMobile ? 1 : fit));
  const fitLift = Math.round(activeLiftPx * (isMobile ? 0.5 : fit));

  const canGoPrev = loop || active > 0;
  const canGoNext = loop || active < len - 1;

  const prev = useCallback(() => {
    if (!len) return;
    if (!canGoPrev) return;
    setActive((a) => wrapIndex(a - 1, len));
  }, [canGoPrev, len]);

  const next = useCallback(() => {
    if (!len) return;
    if (!canGoNext) return;
    setActive((a) => wrapIndex(a + 1, len));
  }, [canGoNext, len]);

  const setCardRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(String(el.dataset.cardId), el);
      return;
    }
    for (const [id, node] of cardRefs.current) {
      if (!node.isConnected) {
        cardRefs.current.delete(id);
        entered.current.delete(id);
      }
    }
  }, []);

  const layoutFor = useCallback(
    (off: number): FanLayout => {
      const abs = Math.abs(off);
      const isActive = off === 0;
      return {
        x: off * cardSpacing,
        y: abs * 10, // subtle arc-down feel
        z: -abs * fitDepth,
        rotateZ: off * stepDeg,
        rotateX: reduceInactiveTilt ? 0 : isActive ? 0 : tiltXDeg,
        scale: reduceInactiveTilt ? 1 : isActive ? activeScale : inactiveScale,
      };
    },
    [cardSpacing, stepDeg, fitDepth, tiltXDeg, activeScale, inactiveScale, reduceInactiveTilt],
  );

  // GSAP: animate every mounted card to its fan position for the current active offset.
  // First time a card appears it does the AnimatePresence-style entrance (opacity 0, +40px fall).
  useLayoutEffect(() => {
    const tweens: gsap.core.Tween[] = [];
    items.forEach((item, i) => {
      const el = cardRefs.current.get(item.id);
      if (!el) return;

      const off = signedOffset(i, active, len, loop);
      const t = layoutFor(off);
      const yFinal = t.y + (off === 0 ? -fitLift : 0);

      if (!entered.current.has(item.id)) {
        entered.current.add(item.id);
        tweens.push(
          gsap.fromTo(
            el,
            {
              opacity: 0,
              x: t.x,
              y: t.y + 40,
              rotateZ: t.rotateZ,
              rotateX: t.rotateX,
              scale: t.scale,
            },
            {
              opacity: 1,
              x: t.x,
              y: yFinal,
              rotateZ: t.rotateZ,
              rotateX: t.rotateX,
              scale: t.scale,
              duration: 0.65,
              ease: "power3.out",
              overwrite: "auto",
            },
          ),
        );
      } else {
        tweens.push(
          gsap.to(el, {
            opacity: 1,
            x: t.x,
            y: yFinal,
            rotateZ: t.rotateZ,
            rotateX: t.rotateX,
            scale: t.scale,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
          }),
        );
      }
    });
    return () => tweens.forEach((tween) => tween.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    containerW,
    len,
    items,
    loop,
    cardSpacing,
    stepDeg,
    fitDepth,
    fitLift,
    tiltXDeg,
    activeScale,
    inactiveScale,
    layoutFor,
  ]);

  // drag only on the active card: elastic x follow + swipe detection (travel / velocity)
  useEffect(() => {
    const activeItem = len ? items[wrapIndex(active, len)] : undefined;
    const el = activeItem ? cardRefs.current.get(activeItem.id) : undefined;
    if (!el) return;

    const threshold = isMobile ? Math.min(80, w * 0.18) : Math.min(160, w * 0.22);
    const limit = isMobile ? w * 0.28 : w * 0.3;
    let dragging = false;
    let travel = 0;
    let startX = 0;
    let samples: Array<{ t: number; x: number }> = [];

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("a[href]")) return;
      dragging = true;
      travel = 0;
      startX = e.clientX;
      samples = [];
      el.setPointerCapture(e.pointerId);
      gsap.killTweensOf(el, "x");
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const offset = e.clientX - startX;
      travel = offset;
      const elastic =
        offset > limit
          ? limit + (offset - limit) * 0.3
          : offset < -limit
            ? -limit + (offset + limit) * 0.3
            : offset;
      gsap.set(el, { x: elastic });
      samples.push({ t: performance.now(), x: offset });
      if (samples.length > 8) samples.shift();
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      let v = 0;
      if (samples.length >= 2) {
        const a = samples[samples.length - 2];
        const b = samples[samples.length - 1];
        const dt = (b.t - a.t) / 1000;
        if (dt > 0) v = (b.x - a.x) / dt;
      }
      suppressClick.current = Math.abs(travel) > 8;
      if (travel > threshold || v > 650) prev();
      else if (travel < -threshold || v < -650) next();
      else
        gsap.to(el, {
          x: 0,
          duration: 0.55,
          ease: "power3.out",
          overwrite: "auto",
        });
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
  }, [active, w, len, items, prev, next, isMobile]);

  // autoplay
  useEffect(() => {
    if (!autoAdvance) return;
    if (!len) return;
    if (pauseOnHover && hovering) return;

    const id = window.setInterval(
      () => {
        if (loop || active < len - 1) next();
      },
      Math.max(700, intervalMs),
    );

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoAdvance,
    intervalMs,
    hovering,
    pauseOnHover,
    len,
    loop,
    active,
    next,
  ]);

  // keyboard navigation (when stage focused)
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
      {/* Stage */}
      <div
        ref={stageRef}
        className="relative w-full"
        style={{ height: isMobile ? h + 48 : Math.max(380, h + 80) }}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-48 w-[70%] rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-40 w-[76%] rounded-full bg-vortex/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: `${perspectivePx}px` }}
        >
          {items.map((item, i) => {
            const off = signedOffset(i, active, len, loop);
            const abs = Math.abs(off);
            const visible = abs <= maxOffset;

            // hide far-away cards cleanly
            if (!visible) return null;

            const t = layoutFor(off);
            const isActive = off === 0;
            const yFinal = t.y + (isActive ? -fitLift : 0);
            const zIndex = 100 - abs;

            return (
              <div
                key={item.id}
                data-card-id={item.id}
                ref={setCardRef}
                className={cn(
                  "absolute inset-y-0 m-auto rounded-2xl shadow-xl",
                  "will-change-transform select-none",
                  isActive
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer",
                )}
                style={{
                  width: w,
                  maxWidth: "100%",
                  height: h,
                  zIndex,
                  transformStyle: "preserve-3d",
                  transform: `translate3d(${t.x}px, ${yFinal}px, 0) rotateZ(${t.rotateZ}deg) rotateX(${t.rotateX}deg) scale(${t.scale})`,
                  touchAction: "none",
                }}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  setActive(i);
                }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-2xl"
                  style={{
                    transform: `translateZ(${t.z}px)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <DefaultFanCard item={item} active={isActive} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile arrows - larger hit area */}
        {isMobile && len > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-lg hover:bg-black/60 active:scale-95 transition-all md:hidden touch-manipulation"
              aria-label="Proyecto anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-lg hover:bg-black/60 active:scale-95 transition-all md:hidden touch-manipulation"
              aria-label="Proyecto siguiente"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots navigation centered at bottom - larger hit area on mobile */}
      {showDots ? (
        <div className="mt-4 md:mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2.5 md:gap-2">
            {items.map((it, idx) => {
              const on = idx === active;
              return (
                <button
                  key={it.id}
                  onClick={() => setActive(idx)}
                  className={cn(
                    "h-3 w-3 md:h-2.5 md:w-2.5 rounded-full transition-all duration-300 touch-manipulation",
                    on ? "w-8 md:w-7 bg-vortex" : "bg-white/40 hover:bg-white/60 active:bg-white/70",
                  )}
                  aria-label={`Ir a ${it.title}`}
                  style={{ minHeight: "12px", minWidth: on ? "32px" : "12px" }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
      {isMobile && len > 1 && showDots && (
        <div className="mt-3 flex justify-center md:hidden">
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase">Desliza • Toca para ver</span>
        </div>
      )}
    </div>
  );
}

function DefaultFanCard({
  item,
}: {
  item: CardStackItem;
}) {
  const hasImage = Boolean(item.imageSrc);
  const bgClass = item.tag ?? "bg-ink-soft/60";

  return (
    <div className="relative h-full w-full">
      {/* image or brand-color block */}
      <div className="absolute inset-0">
        {hasImage ? (
          <img
            src={item.imageSrc!}
            alt={item.title}
            className="h-full w-full object-cover"
            draggable={false}
            loading="eager"
          />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center", bgClass)}>
            <span className="font-mono text-xs tracking-[0.3em] text-white/70 uppercase">
              {item.title}
            </span>
          </div>
        )}
      </div>

      {/* subtle gradient overlay at bottom for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

      {/* content - keep text in 3D context */}
      <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-5">
        <div className="min-w-0 pr-2 md:pr-0">
          <div className="truncate text-base font-bold tracking-tight text-white md:text-xl">
            {item.title}
          </div>
          {item.description ? (
            <div className="mt-1.5 line-clamp-2 text-sm leading-snug font-medium text-white/85 md:font-mono md:text-xs md:text-white/80">
              {item.description}
            </div>
          ) : null}
        </div>
      </div>

      {/* button - separate layer to avoid 3D transform blur, larger hit area on mobile */}
      {item.href && (
        <a
          href={item.href}
          className="absolute bottom-4 right-4 md:bottom-5 md:right-5 z-20 flex items-center gap-1.5 shrink-0 rounded-full bg-white text-ink px-4 py-2.5 text-sm font-semibold shadow-lg hover:bg-white/90 active:scale-95 md:bg-white/15 md:text-white md:px-3 md:py-1.5 md:text-xs md:font-medium md:shadow-none md:hover:bg-white/20 transition-all duration-200 touch-manipulation"
          target="_blank"
          rel="noopener noreferrer"
          style={{ transform: "translateZ(20px)", minHeight: "44px", minWidth: "44px" }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="hidden md:inline">{item.ctaLabel ?? "Ver proyecto"}</span>
          <span className="md:hidden">{item.ctaLabel ?? "Ver"}</span>
          <svg
            className="h-4 w-4 md:h-3.5 md:w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  );
}
