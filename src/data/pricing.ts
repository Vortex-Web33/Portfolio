import type { PricingPlan } from "../types";

export const pricingPlans: PricingPlan[] = [
  {
    name: "Sitio vitrina",
    description:
      "Sitio web profesional de 3 a 5 páginas, optimizado para Google y compatible con móvil. Ideal para dar visibilidad a tu actividad.",
    price: "Desde 2 900 €",
    ctaLabel: "Solicitar presupuesto",
    ctaHref: "/contacto/",
  },
  {
    name: "Tienda online",
    description:
      "E-commerce completo: catálogo, carrito, pagos y gestión de pedidos. Pensado para vender desde el primer día.",
    price: "Desde 6 500 €",
    featured: true,
    ctaLabel: "Solicitar presupuesto",
    ctaHref: "/contacto/",
  },
  {
    name: "Acompañamiento SEO",
    description:
      "Posicionamiento natural de tu sitio: auditoría, contenidos y seguimiento mensual de resultados.",
    price: "Desde 490 €/mes",
    ctaLabel: "Solicitar presupuesto",
    ctaHref: "/contacto/",
  },
];
