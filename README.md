# VORTEX — Portfolio

Sitio web de la agencia VORTEX (Madrid). Astro 7 + Tailwind CSS 4 + React (primitivos UI) + GSAP.

## Project Structure

```text
/
├── robots.txt            # Meta files en la raíz del proyecto
├── site.webmanifest      # se emiten a la raíz del sitio en cada build
├── astro.config.mjs
├── public/               # Assets estáticos servidos tal cual (favicon, logo, stickers)
├── src/
│   ├── seo/              # SEO.astro (meta/OG/Twitter/JSON-LD)
│   ├── layouts/          # Layout.astro (shell HTML + Header/Footer + estilos)
│   ├── pages/            # Rutas (index.astro)
│   ├── components/       # App.astro (composición) + ui/ (primitivos React: Button,
│   │   │                 #   Marquee, Reveal, TextLoop, Grainient, StickerTrail) + Container.astro
│   ├── sections/         # Bloques de página en Astro (Hero, ServicesSection, ContactSection…)
│   ├── config/           # site.ts (marca, contacto, dirección, redes)
│   ├── data/             # services.ts, projects.ts
│   ├── types/            # Contratos TypeScript compartidos
│   └── styles/           # theme.css (tokens), base.css (componentes), global.css (entrada)
```

## Commands

| Command                   | Action                                             |
| :------------------------ | :------------------------------------------------- |
| `pnpm install`            | Installs dependencies                              |
| `pnpm dev`                | Starts local dev server at `localhost:4321`        |
| `pnpm build`              | Builds to `./dist/` (emite robots.txt y webmanifest)|
| `pnpm preview`            | Previews the production build locally              |
| `pnpm astro check`        | Typechecks the project (requiere TypeScript 6.x)   |
