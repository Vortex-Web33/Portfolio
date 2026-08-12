import type { SiteConfig, ContactConfig, SocialLink } from "@/types";

export const site: SiteConfig = {
  name: "VORTEX",
  legalName: "Agencia VORTEX",
  url: "https://vortex.agency",
  locale: "es_ES",
  lang: "es",
  defaultTitle: "Agencia Web Malaga - Creación de sitios web, SEO & SEA",
  defaultDescription:
    "VORTEX es una agencia web con sede en Malaga, especialista en creación de sitios web a medida, webdesign, e-commerce y estrategia digital.",
  ogImage: "/og-default.svg",
  themeColor: "#000000",
  twitterHandle: "@vortex_agency",
  founded: "2026",
};

export const contact: ContactConfig = {
  phone: "+34 663 00 74 73",
  phoneHref: "tel:+34663007473",
  email: "hello@vortex.agency",
  emailHref: "mailto:hello@vortex.agency",
  address: {
    street: "",
    city: "Malaga",
    postalCode: "29010",
    country: "España",
    full: "29010 Málaga – España",
  },
};

export const socials: SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/vortex.agency/" },
  { label: "Instagram", href: "https://www.instagram.com/vortex.agency/" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/vortex.agency/",
  },
  { label: "GitHub", href: "https://github.com/vortex.agency/" },
];
