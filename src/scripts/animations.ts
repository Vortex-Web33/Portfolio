import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations(): void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (reducedMotion) return;

  gsap.utils.toArray<HTMLElement>("[data-hero-anim]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { y: 48, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.12 * i + 0.15 },
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((mq) => {
    const track = mq.querySelector(".marquee-track");
    if (!track) return;
    const dir = mq.dataset.direction === "rtl" ? -1 : 1;
    const speed = Number(mq.dataset.speed) || 40;
    gsap.fromTo(
      track,
      { xPercent: 0 },
      { xPercent: dir * 50, duration: speed, ease: "none", repeat: -1 },
    );
  });
}
