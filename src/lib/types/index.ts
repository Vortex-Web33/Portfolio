export interface ServiceFeature {
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  accent: string;
  glyph: string;
  heroColor: string;
  ctaLabel: string;
  features: ServiceFeature[];
  seo: {
    title: string;
    description: string;
  };
}

export interface Project {
  name: string;
  tagline: string;
  url: string;
  bg: string;
  image?: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  full: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface ContactConfig {
  email: string;
  emailHref: string;
  address: Address;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  url: string;
  locale: string;
  lang: string;
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
  themeColor: string;
  twitterHandle: string;
  founded: string;
}
