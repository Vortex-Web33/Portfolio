// StickerTrail: estela de stickers (clones de <img> de /stickers/) que sigue al cursor
// con la Web Animations API; controla frecuencia, cantidad máxima y tamaño.
import { useLayoutEffect, useRef } from "react";

interface Props {
  stickers?: string[];
  frequency?: number;
  maxRendered?: number;
  size?: string;
  className?: string;
}

const DEFAULT_STICKERS = [
  "/stickers/stick001.svg",
  "/stickers/stick002.svg",
  "/stickers/stick006.svg",
  "/stickers/stick007.svg",
  "/stickers/stick008.svg",
  "/stickers/stick-square-001.svg",
  "/stickers/stick-square-002.svg",
  "/stickers/stick-square-003.svg",
];

export default function StickerTrail({
  stickers = DEFAULT_STICKERS,
  frequency = 180,
  maxRendered = 40,
  size = "w-[72px] md:w-20",
  className = "",
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const trail = elRef.current;
    if (!trail) return;

    const sourceImgs = [...trail.querySelectorAll<HTMLImageElement>("img")];
    const rendered: HTMLImageElement[] = [];
    let last = { x: 0, y: 0 };

    const spawn = (x: number, y: number) => {
      if (rendered.length >= maxRendered) return;
      const source = sourceImgs[Math.floor(Math.random() * sourceImgs.length)];
      const img = source.cloneNode() as HTMLImageElement;
      img.className = `absolute h-auto pointer-events-none will-change-transform ${size}`;
      const rotate = Math.random() * 40 - 20;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      trail.appendChild(img);
      const anim = img.animate(
        [
          {
            opacity: 0,
            transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(0.2)`,
          },
          {
            opacity: 1,
            transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(1)`,
          },
          {
            opacity: 1,
            transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(1.05)`,
          },
          {
            opacity: 0,
            transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(1.2)`,
          },
        ],
        { duration: 1600, easing: "ease-out", fill: "forwards" },
      );
      rendered.push(img);
      anim.finished.finally(() => {
        img.remove();
        const i = rendered.indexOf(img);
        if (i !== -1) rendered.splice(i, 1);
      });
    };

    const handleMove = (x: number, y: number) => {
      const rect = trail.getBoundingClientRect();
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      const d = Math.hypot(x - last.x, y - last.y);
      if (d > frequency) {
        last = { x, y };
        spawn(x, y);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = trail.getBoundingClientRect();
      handleMove(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const rect = trail.getBoundingClientRect();
      handleMove(
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top,
      );
    };

    const resetLast = () => {
      last = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    trail.addEventListener("mouseleave", resetLast);
    window.addEventListener("touchend", resetLast);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      trail.removeEventListener("mouseleave", resetLast);
      window.removeEventListener("touchend", resetLast);
      rendered.forEach((img) => img.remove());
      rendered.length = 0;
    };
  }, [frequency, maxRendered, size, stickers]);

  return (
    <div
      ref={elRef}
      className={`pointer-events-none absolute inset-0 z-10 overflow-clip ${className}`.trim()}
      aria-hidden="true"
    >
      {stickers.map((src) => (
        <img
          key={src}
          className="pointer-events-none absolute top-0 left-[-9999px] h-auto w-18 opacity-0 md:w-20"
          src={src}
          alt=""
          draggable={false}
        />
      ))}
    </div>
  );
}
