export interface Project {
  name: string;
  tagline: string;
  url: string;
  bg: string;
}

export const projects: Project[] = [
  {
    name: "WOOD",
    tagline: "Hotel & Spa",
    url: "https://woodhotel.re/",
    bg: "bg-vortex",
  },
  {
    name: "ISAUTIER",
    tagline: "Patrimonio & Promoción",
    url: "https://isautier-ipp.com",
    bg: "bg-vortex-blue",
  },
  {
    name: "TOYOTA",
    tagline: "Yaris Cross",
    url: "https://yariscross.re",
    bg: "bg-vortex-coral",
  },
  {
    name: "VAKOA",
    tagline: "Destilería",
    url: "https://vakoadistillerie.com",
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
