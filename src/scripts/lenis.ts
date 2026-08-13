// Smooth scroll global: Lenis con la config estándar usada en el resto de webs
// (lerp/duration/smoothWheel/wheelMultiplier/touchMultiplier/infinite), con el
// bucle rAF propio. Se sincroniza con GSAP ScrollTrigger (necesario para el pin
// de HorizontalGallery) y suaviza anclajes (/#contacto) y teclado.
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const lenis = new Lenis({
  lerp: 0.3,
  duration: 1.2,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
});

lenis.on("scroll", ScrollTrigger.update);

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const HEADER_OFFSET = -96;

document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement | null)?.closest?.('a[href*="#"]');
  if (!link) return;

  const url = new URL(link.href, window.location.origin);
  if (
    url.origin !== window.location.origin ||
    url.pathname !== window.location.pathname
  )
    return;

  const section =
    url.hash.length > 1 ? document.getElementById(url.hash.slice(1)) : null;
  if (!section) return;

  event.preventDefault();
  lenis.scrollTo(section, { offset: HEADER_OFFSET, duration: 1.4 });
});

// Lenis no suaviza el teclado (flechas, Re Pág, Espacio, Inicio/Fin):
// lo interceptamos y lo convertimos en scroll suave animado.
document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;
  const focused =
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable ||
      !!target.closest("button, a"));
  if (focused || event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    lenis.scrollTo(event.key === "Home" ? 0 : lenis.limit, { duration: 1.1 });
    return;
  }

  const page = window.innerHeight;
  const deltas: Record<string, number> = {
    ArrowUp: -140,
    ArrowDown: 140,
    PageUp: -page,
    PageDown: page,
    " ": page,
  };
  const delta = deltas[event.key];
  if (delta === undefined) return;

  event.preventDefault();
  lenis.scrollTo(window.scrollY + delta, { duration: 0.9 });
});
