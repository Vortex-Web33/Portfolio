import type { SiteConfig, ContactConfig, SocialLink, NavItem } from "@/types";

export const site: SiteConfig = {
  name: "VORTEX",
  legalName: "Agencia VORTEX",
  url: "https://vortex.agency",
  locale: "es_ES",
  lang: "es",
  defaultTitle: "Agencia Web Madrid - Creación de sitios web, SEO & SEA",
  defaultDescription:
    "VORTEX es una agencia web con sede en Madrid, especialista en creación de sitios web a medida, webdesign, e-commerce y estrategia digital.",
  ogImage: "/og-default.svg",
  themeColor: "#000000",
  twitterHandle: "@vortex_agency",
  founded: "2012",
};

export const contact: ContactConfig = {
  phone: "+34 663 00 74 73",
  phoneHref: "tel:+34663007473",
  email: "hello@vortex.agency",
  emailHref: "mailto:hello@vortex.agency",
  address: {
    street: "Calle de Ferrandière",
    city: "Madrid",
    postalCode: "28013",
    country: "España",
    full: "Calle de Ferrandière, 28013 Madrid – España",
  },
};

export const socials: SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61587578708999" },
  { label: "Instagram", href: "https://www.instagram.com/m0r3z" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/m0r3z" },
  { label: "GitHub", href: "https://github.com/m0r3z" },
];

export const navItems: NavItem[] = [
  { label: "La Agencia", href: "/agencia-web-lyon/" },
  { label: "Realizaciones", href: "/realizaciones/" },
  {
    label: "Servicios",
    href: "/servicios/",
    children: [
      { label: "Creación de sitios web", href: "/creacion-sitios-web/" },
      { label: "Auditoría y Consultoría", href: "/auditoria-consultoria/" },
      { label: "Diseño e Identidad visual", href: "/diseno-identidad-visual/" },
      { label: "Posicionamiento SEO", href: "/posicionamiento-seo-lyon/" },
    ],
  },
  { label: "Ofertas", href: "/ofertas-tarifas/" },
  { label: "Contacto y Presupuesto", href: "/contacto/" },
];

export const footerNav: { agency: NavItem[]; offers: NavItem[] } = {
  agency: [
    { label: "¿Quiénes son?", href: "/agencia-web-lyon/" },
    { label: "Realizaciones", href: "/realizaciones/" },
    { label: "El Blog", href: "/blog/" },
    { label: "Observatorio de Agencias Web", href: "/observatorio-agencia-web/" },
    { label: "Contacto y presupuesto", href: "/contacto/" },
  ],
  offers: [
    { label: "Servicios y competencias", href: "/servicios/" },
    { label: "Ofertas y tarifas", href: "/ofertas-tarifas/" },
    { label: "Creación de sitios web", href: "/creacion-sitios-web/" },
    { label: "Posicionamiento SEO", href: "/posicionamiento-seo-lyon/" },
    { label: "Auditoría y Consultoría", href: "/auditoria-consultoria/" },
  ],
};
