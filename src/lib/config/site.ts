import type { SiteConfig, ContactConfig, SocialLink } from "@/lib/types";

export const site: SiteConfig = {
  twitterHandle: "@vortex_agency",
  name: "VORTEX",
  legalName: "Agencia VORTEX",
  url: "https://vortex.agency",
  locale: "es_ES",
  lang: "es",
  defaultTitle:
    "Agencia Web en Malaga - Creación de sitios web & posicionamiento SEO",
  defaultDescription:
    "VORTEX es una agencia web con sede en Malaga, especialista en creación de sitios web a medida, webdesign, e-commerce y estrategia digital.",
  ogImage: "/og-default.svg",
  themeColor: "#000000",
  founded: "2026",
};

export const contact: ContactConfig = {
  email: "vortexagency3@gmail.com",
  emailHref: "mailto:vortexagency3@gmail.com",
  address: {
    street: "",
    city: "Malaga",
    postalCode: "29013",
    country: "España",
    full: "29013 Málaga – España",
  },
  formspreeEndpoint: "https://formspree.io/f/mjyvvpyk",
};

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/Vortex-Web33" },
];
