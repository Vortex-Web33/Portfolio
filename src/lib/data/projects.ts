import type { Project } from "@/lib/types";

export const projects: Project[] = [
{
    name: "TechUniverse",
    tagline: "E-commerce",
    url: "https://tech-universe1.vercel.app/",
    bg: "bg-vortex",
    image: "/imagenes/techuniverse.jpg",
  },
  {
    name: "Aura Store",
    tagline: "Storefront",
    url: "https://aurastore-one.vercel.app/",
    bg: "bg-vortex-blue",
    image: "/imagenes/aurastore.jpg",
  },
  {
    name: "Terral Studio",
    tagline: "Frontend arquitectura",
    url: "https://terral-studio.vercel.app/",
    bg: "bg-vortex-coral",
    image: "/imagenes/terralstudio.jpg",
  },
];

export const clients = [
  "Atable",
  "Toyota",
  "Energies",
  "Wood",
  "Isautier",
  "Ness",
  "Akoya",
  "Canaille",
  "REP",
  "Archipel",
  "Dentalpei",
  "Vakoa",
  "Truckingo",
  "Coffee",
] as const;
