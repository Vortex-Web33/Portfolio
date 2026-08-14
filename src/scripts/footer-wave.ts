// Ola del footer: el SVG de gradiente ocupa TODO el footer y su curva superior se
// morfea con MorphSVGPlugin (GSAP). La curva es un único lomo cuya cresta está
// centrada al 50% del ancho (x=1139 del viewBox), con los bordes planos. Al entrar
// en viewport la cresta sube por encima del borde con rebote elástico (la velocidad
// de scroll modula la altura); mientras se hace scroll sobre el footer reacciona a
// la velocidad, y en reposo la cresta oscila arriba y abajo del borde sin parar,
// como una ola real. En pantallas estrechas (mobile) se reduce la amplitud para que
// la cresta no quede desproporcionada sobre un viewport tan angosto.
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

let idleTween: gsap.core.Tween | null = null;

function breathe() {
  idleTween?.kill();
  idleTween = gsap
    .timeline({ repeat: -1 })
    .to(path, { duration: 2.4, morphSVG: rise(60), ease: "sine.inOut" })
    .to(path, { duration: 2.4, morphSVG: dip(60), ease: "sine.inOut" });
}

ScrollTrigger.create({
  trigger: ".footer",
  start: "top bottom",
  end: "bottom bottom",
  onEnter: (self) => {
    const velocity = self.getVelocity();
    const variation = velocity / 10000;
    const boost = Math.min(Math.abs(velocity) / 10, 160);

    gsap
      .timeline({ overwrite: "auto" })
      .fromTo(
        path,
        { morphSVG: down() },
        {
          duration: 2,
          morphSVG: rise(boost),
          ease: `elastic.out(${1 + variation}, ${1 - variation})`,
        }
      )
      .to(path, {
        duration: 0.9,
        morphSVG: center,
        ease: "power2.inOut",
      })
      .call(breathe);
  },
  onUpdate: (self) => {
    const velocity = self.getVelocity();
    if (Math.abs(velocity) < 60) return;
    idleTween?.kill();
    idleTween = null;
    gsap.to(path, {
      duration: 0.6,
      morphSVG:
        velocity > 0
          ? rise(Math.min(velocity / 9, 150))
          : dip(Math.min(-velocity / 9, 90)),
      ease: "power2.out",
      overwrite: "auto",
      onComplete: breathe,
    });
  },
});
