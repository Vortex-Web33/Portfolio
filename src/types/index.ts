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
}

export interface PricingPlan {
  name: string;
  description: string;
  price: string;
  featured?: boolean;
  ctaLabel: string;
  ctaHref: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
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
  phone: string;
  phoneHref: string;
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
