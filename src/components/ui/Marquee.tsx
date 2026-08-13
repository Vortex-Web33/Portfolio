// Marquee: cinta de contenido (children) que se desplaza en bucle infinito con GSAP;
// dirección ltr/rtl y duración definidas por props.
import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface Props {
  direction?: "ltr" | "rtl";
  speed?: number;
  className?: string;
  children: ReactNode;
}

export default function Marquee({ direction = "ltr", speed = 40, className = "", children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const dir = direction === "rtl" ? -1 : 1;
    const tween = gsap.fromTo(
      track,
      { xPercent: 0 },
      { xPercent: dir * 50, duration: speed, ease: "none", repeat: -1 },
    );

    return () => {
      tween.kill();
    };
  }, [direction, speed]);

  return (
    <div className={`overflow-hidden ${className}`.trim()} aria-hidden="true">
      <div ref={trackRef} className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group">{children}</div>
      </div>
    </div>
  );
}
