import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: ElementType;
  className?: string;
  delay?: number;
  trigger?: "scroll" | "mount";
  children: ReactNode;
}

export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  trigger = "scroll",
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (trigger === "mount") {
      const tween = gsap.fromTo(
        el,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay },
      );
      return () => tween.kill();
    }

    const tween = gsap.fromTo(
      el,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay,
        scrollTrigger: { trigger: el, start: "top 88%" },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, trigger]);

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  );
}
