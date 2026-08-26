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

  const maxOffset = Math.max(0, Math.floor(maxVisible / 2));

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

  // scale the whole fan down to fit narrow (mobile) containers while keeping size on desktop
  const fit = Math.min(1, (containerW || cardWidth) / cardWidth);
  const w = Math.max(240, Math.round(cardWidth * fit));
  const h = Math.max(160, Math.round(cardHeight * fit));

  // natural spacing shrinks the fan to always fit the available width (no edge clipping)
  const naturalSpacing = Math.round(w * (1 - overlap));
  const roomForFan =
    containerW > w ? (containerW - w) / (2 * Math.max(1, maxOffset)) : 0;
  const cardSpacing =
    containerW > 0 && roomForFan < naturalSpacing
      ? Math.max(8, Math.round(roomForFan))
      : naturalSpacing;

  const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;
  const fitDepth = Math.round(depthPx * fit);
  const fitLift = Math.round(activeLiftPx * fit);

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
        rotateX: isActive ? 0 : tiltXDeg,
        scale: isActive ? activeScale : inactiveScale,
      };
    },
    [cardSpacing, stepDeg, fitDepth, tiltXDeg, activeScale, inactiveScale],
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

    const threshold = Math.min(160, w * 0.22);
    const limit = w * 0.3;
    let dragging = false;
    let travel = 0;
    let startX = 0;
    let samples: Array<{ t: number; x: number }> = [];

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
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
  }, [active, w, len, items, prev, next]);

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
        style={{ height: Math.max(380, h + 80) }}
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
      </div>

      {/* Dots navigation centered at bottom */}
      {showDots ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {items.map((it, idx) => {
              const on = idx === active;
              return (
                <button
                  key={it.id}
                  onClick={() => setActive(idx)}
                  className={cn(
                    "h-2 w-2 rounded-full transition",
                    on ? "w-6 bg-vortex" : "bg-white/30 hover:bg-white/50",
                  )}
                  aria-label={`Ir a ${it.title}`}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DefaultFanCard({
  item,
  active,
}: {
  item: CardStackItem;
  active: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      {/* image or brand-color block */}
      <div className="absolute inset-0">
        {item.imageSrc ? (
          <img
            src={item.imageSrc}
            alt={item.title}
            className="h-full w-full object-cover"
            draggable={false}
            loading="eager"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              item.tag ?? "bg-ink-soft/60",
            )}
          >
            <span className="font-mono text-xs tracking-[0.3em] text-white/70 uppercase">
              {item.title}
            </span>
          </div>
        )}
      </div>

      {/* subtle gradient overlay at bottom for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

{/* content */}
       <div className="relative z-10 flex h-full flex-col justify-end p-5">
         <div className="flex items-end justify-between gap-4">
           <div className="min-w-0">
             <div className="truncate text-lg font-semibold text-white md:text-xl">
               {item.title}
             </div>
             {item.description ? (
               <div className="mt-1 line-clamp-2 font-mono text-xs text-white/80">
                 {item.description}
               </div>
             ) : null}
           </div>
           {item.href && (
             <a
               href={item.href}
               className="flex items-center gap-1.5 shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
               target="_blank"
               rel="noopener noreferrer"
             >
               {item.ctaLabel ?? "Ver proyecto"}
               <svg
                 className="h-3.5 w-3.5"
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
       </div>
    </div>
  );
}
