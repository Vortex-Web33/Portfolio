import { useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  text?: string;
  shape?: "circle" | "infinity" | "arch" | "line" | "wave";
  path?: string;
  speed?: number;
  direction?: "forward" | "reverse";
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
}

const VIEW_W = 1200;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 6;

const buildPath = (shape: string, curviness: number, ribbonWidth: number) => {
  const c = Math.max(0, curviness);
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case "circle": {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case "infinity": {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        "Z",
      ].join(" ");
    }
    case "arch": {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
    }
    case "line":
      return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`;
    case "wave":
    default: {
      const a = Math.min(c * 2.2, room * 2);
      return `M -320 ${CY} Q -160 ${CY - a} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`;
    }
  }
};

export default function TextLoop({
  text = "React ✦ Bits",
  shape = "wave",
  path,
  speed = 90,
  direction = "forward",
  separator = "✦",
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = "#ffffff",
  ribbon = true,
  ribbonColor = "#5227FF",
  ribbonWidth = 86,
  pauseOnHover = true,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const headRef = useRef<SVGTextPathElement>(null);
  const tailRef = useRef<SVGTextPathElement>(null);

  const uid = useId().replace(/[:]/g, "");
  const pathId = `text-loop-${uid}`;

  const isWave = shape === "wave" && !path;
  const waveAmp = isWave ? Math.min(Math.max(0, curviness) * 2.2, Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD) * 2) : 0;
  const vbY = isWave ? CY - waveAmp - Math.max(0, ribbonWidth) / 2 : 0;
  const vbH = isWave ? 2 * (waveAmp + Math.max(0, ribbonWidth) / 2) : VIEW_H;

  const d = path || buildPath(shape, curviness, ribbonWidth);
  const unit = `${uppercase ? String(text).toUpperCase() : String(text)}\u00A0${separator || ""}\u00A0`;
  const textStyle = { fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` };

  useLayoutEffect(() => {
    const root = rootRef.current;
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    const headEl = headRef.current;
    const tailEl = tailRef.current;
    if (!root || !pathEl || !measureEl || !headEl || !tailEl) return;

    const measure = () => {
      try {
        const length = pathEl.getTotalLength();
        const unitWidth = measureEl.getComputedTextLength();
        if (!length || !unitWidth) return;
        const reps = Math.max(1, Math.round(length / unitWidth));
        const loopText = unit.repeat(reps);
        headEl.textContent = loopText;
        tailEl.textContent = loopText;
        headEl.setAttribute("textLength", String(length));
        tailEl.setAttribute("textLength", String(length));
      } catch {
        return;
      }
    };

    measure();
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    let length = 0;
    try {
      length = pathEl.getTotalLength();
    } catch {
      return;
    }
    if (!length) return;

    const apply = (offset: number) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      headEl.setAttribute("startOffset", String(offset));
      tailEl.setAttribute("startOffset", String(partner));
    };

    apply(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || speed <= 0) return;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === "reverse" ? -length : length,
      duration: length / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => apply(state.offset),
    });

    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover) {
      root.addEventListener("pointerenter", pause);
      root.addEventListener("pointerleave", resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover) {
        root.removeEventListener("pointerenter", pause);
        root.removeEventListener("pointerleave", resume);
      }
    };
  }, [speed, direction, pauseOnHover, unit, d]);

  return (
    <div ref={rootRef} className={`relative w-full overflow-hidden ${className}`.trim()}>
      <svg
        className="block h-auto w-full"
        viewBox={`0 ${vbY} ${VIEW_W} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : "none"}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="invisible pointer-events-none" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text className="select-none" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0} lengthAdjust="spacing">
            {unit}
          </textPath>
        </text>

        <text className="select-none" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0} lengthAdjust="spacing">
            {unit}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
