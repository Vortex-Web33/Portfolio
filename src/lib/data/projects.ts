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
    name: "ISAUTIER",
    tagline: "Patrimonio & Promoción",
    url: "/404",
    bg: "bg-vortex-blue",
  },
  {
    name: "TOYOTA",
    tagline: "Yaris Cross",
    url: "/404",
    bg: "bg-vortex-coral",
  },
  {
    name: "VAKOA",
    tagline: "Destilería",
    url: "/404",
    bg: "bg-vortex",
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
