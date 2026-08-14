// Ola del footer: el SVG de gradiente ocupa TODO el footer y su curva superior se
// morfea con MorphSVGPlugin (GSAP). La curva es un único lomo cuya cresta está
// centrada al 50% del ancho (x=1139 del viewBox), con los bordes planos.
// La entrada con rebote elástico solo ocurre la primera vez; después la ola oscila
// en un bucle infinito rise/dip (arriba y abajo del borde, como una ola real) que
// nunca se corta ni se reinicia al repasar el footer: cada ciclo arranca desde el
// estado actual y la velocidad de scroll modula la amplitud suavemente.
// En pantallas estrechas (mobile) se reduce la amplitud para que la cresta no
// quede desproporcionada sobre un viewport tan angosto.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

const path = "#bouncy-path";
const wave = (h: number) =>
  `M0 0 C0 0,464 ${h},1139 ${h} S1814 ${h},2278 0 V683 H0 V0 z`;

const mq = window.matchMedia("(max-width: 767px)");
let amp = mq.matches ? 0.45 : 1;
mq.addEventListener("change", () => {
  amp = mq.matches ? 0.45 : 1;
});

const down = () => wave(260 * amp);
const center = wave(0);
const rise = (h: number) => wave(-h * amp);
const dip = (h: number) => wave(h * amp);

// La entrada elástica se ejecuta solo la primera vez que el footer entra en
// viewport; al repasarlo, la ola simplemente sigue viva sin reiniciarse.
let entered = false;

// Bucle de oleaje infinito: sube por encima del borde, baja hacia el footer y
// vuelve, siempre arrancando desde el estado actual (nunca salta ni se corta).
let loopTween: gsap.core.Tween | null = null;

function undulate() {
  loopTween?.kill();
  loopTween = gsap
    .timeline({ onComplete: undulate })
    .to(path, { duration: 3.6, morphSVG: rise(55), ease: "sine.inOut" })
    .to(path, { duration: 3.6, morphSVG: dip(55), ease: "sine.inOut" });
}

ScrollTrigger.create({
  trigger: ".footer",
  start: "top bottom",
  end: "bottom bottom",
  onEnter: (self) => {
    if (entered) return;
    entered = true;

    const velocity = self.getVelocity();
    const variation = velocity / 10000;
    const boost = Math.min(Math.abs(velocity) / 10, 160);

    gsap
      .timeline({ overwrite: "auto" })
      .fromTo(
        path,
        { morphSVG: down() },
        {
          duration: 2.8,
          morphSVG: rise(boost),
          ease: `elastic.out(${1 + variation}, ${1 - variation})`,
        }
      )
      .to(path, {
        duration: 1.2,
        morphSVG: center,
        ease: "power2.inOut",
      })
      .call(undulate);
  },
  onUpdate: (self) => {
    const velocity = self.getVelocity();
    if (!entered || Math.abs(velocity) < 60) return;
    gsap.to(path, {
      duration: 1.1,
      morphSVG:
        velocity > 0
          ? rise(Math.min(velocity / 9, 150))
          : dip(Math.min(-velocity / 9, 90)),
      ease: "power2.out",
      overwrite: "auto",
      onComplete: undulate,
    });
  },
});
