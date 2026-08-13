# AGENTS.md

## Commands

- Package manager is **pnpm** (pnpm-lock.yaml, workspace file present). Node >= 22.12.0.
- Dev server: `astro dev --background` (Astro 7 background mode). Manage it with `astro dev stop`, `astro dev status`, `astro dev logs` (use `pnpm astro dev ...` to avoid relying on PATH).
- No tests, lint, or typecheck scripts. Verification is `pnpm build` (outputs to `dist/`, gitignored); typechecking is `pnpm astro check` (requires typescript 6.x — TS 7 breaks it).

## Architecture

- Static multi-page Astro site, **all content in Spanish** (Spanish agency site, not the French reference site). Do not translate or anglicize copy.
- Folders are split by **concern**, inside `src/`:

  | Carpeta | Para qué sirve | Extensión |
  | --- | --- | --- |
  | `src/pages/` | Rutas. Un archivo por URL: pasa `title`/`description` a `<Layout>` y compone la página desde `sections/`. Nada más vive aquí | `.astro` |
  | `src/layouts/` | Shell del documento (`Layout.astro`: global.css, SEO, Header/Footer) | `.astro` |
  | `src/sections/` | Bloques de página (Hero, ProjectsSection, ContactSection…). Importan primitivas de `components/ui` con `client:load` cuando necesitan animar | `.astro` |
  | `src/components/layout/` | Chrome del sitio usado por `Layout.astro` (Header, Footer) | `.astro` |
  | `src/components/ui/` | Primitivas reutilizables, sin lógica de negocio (Button, Container, Marquee, Reveal, CardStack) | `.astro` o `.tsx` (ver guía) |
  | `src/lib/config/` | Config global: brand, contacto, dirección, redes (editar copy aquí, no en componentes) | `.ts` |
  | `src/lib/data/` | Contenido tipado (servicios, proyectos, clientes) como arrays | `.ts` |
  | `src/lib/types/` | Contratos compartidos (Service, Project, SiteConfig…) | `.ts` |
  | `src/lib/` | Lógica no visual reutilizable (helpers, utils) | `.ts` |
  | `src/scripts/` | Scripts vanilla de cliente que cargan los componentes (`header.ts`) | `.ts` |
  | `src/seo/` | `SEO.astro`: meta/OG/Twitter/JSON-LD, lo usa `Layout.astro` | `.astro` |
  | `src/styles/` | `theme.css`, `base.css`, `global.css` | `.css` |
- **Naming**: componentes PascalCase (`ProjectsSection.astro`, `Button.astro`); datos y config en kebab-case (`site.ts`, `projects.ts`); secciones de página con sufijo `Section` (`Hero` es la excepción del hero único).
- **Technology rule per utility**: `.astro` unless the component needs client-side logic (GSAP/DOM/WebGL/WAAPI) → then `.tsx` (React); plain TS for non-visual logic in `lib/`; vanilla JS via `src/scripts/` when a tiny DOM script is enough. Anchoring: GSAP is the primary animation lib (e.g. `CardStack.tsx` animates its card fan with GSAP `fromTo`/`to` + imperative pointer drag; `TextLoop.tsx` tweens `startOffset`). **framer-motion** remains installed and accepted for React primitives that need declarative animation, but CardStack was ported from framer to GSAP on purpose (more control over the fan/swipe). There is **no `prefers-reduced-motion` guard**: animations always run (removed on purpose because the client's browser had reduce-motion enabled). `@astrojs/react` with `react-jsx` (`tsconfig.json`); pages, layouts and sections stay `.astro`, sections import the React primitives with `client:load` (e.g. `<Reveal client:load />` in `Hero.astro`). Animation logic lives inside each React primitive (GSAP in `useLayoutEffect` with cleanup, or framer-motion with declarative `animate`); don't use `useReducedMotion`/reduced-motion guards.
- `src/layouts/Layout.astro` wires global.css, SEO and Header/Footer. Every page passes `title`/`description` to `<Layout>`.
- Animations (GSAP) are per-component, no global bootstrap script. `Reveal.tsx` (scroll reveal with ScrollTrigger, `as`/`delay`/`trigger` props; `trigger="mount"` for entrance-on-load) and `Marquee.tsx` (loop marquee, `direction`/`speed` props) are the shared animated primitives. `Header.astro` loads a small vanilla script (`src/scripts/header.ts`) for the `scrolled` state (no React needed for that).

### Creating new files

- **Decide the type by utility, in this order:**
  1. ¿Es una ruta? → `.astro` en `src/pages/` (pasando `title`/`description` al `<Layout>`, URL SEO — no renombrar slugs).
  2. ¿Es un bloque de página? → `.astro` en `src/sections/` con sufijo `Section`. Usa `<Reveal client:load />` y demás primitivas para animar. Si el bloque es privado de una sola ruta, agrúpalo en `src/components/page/<route>/` e impórtalo desde la página.
  3. ¿Es una pieza reutilizable? → `src/components/`: documento/chrome del sitio a `layout/`; todo lo demás a `ui/`.
     - ¿Necesita lógica de cliente (GSAP, DOM, WebGL, WAAPI)? → `ui/*.tsx` con React, `export default`, efectos en `useLayoutEffect` con cleanup, y el consumo con `client:load` desde el `.astro` que lo use.
     - ¿Es solo markup/estilos? → `ui/*.astro` (p. ej. `Button.astro`, `Container.astro`). **No** crear `.tsx` sin lógica de cliente: evita islas React innecesarias.
  4. ¿Es contenido/config/tipos? → `.ts` en `src/lib/` (`data/`, `config/`, `types/`) — nunca en componentes.
  5. ¿Es un script DOM tiny que no necesita React? → `src/scripts/*.ts` importado desde el `<script>` de un `.astro` (p. ej. `Header.astro` → `src/scripts/header.ts`).
- **Reglas de import**: escribir la extensión explícita en imports de `.astro` (`@/components/ui/Button.astro`) — la resolución sin extensión falla en el build; para `.tsx`/`.ts` es opcional. Usar siempre el alias `@/` → `src/`.
- **Reglas de componente**: una responsabilidad por archivo; `ui/` sin lógica de negocio; secciones no importan secciones; `client:load` solo sobre el primitivo que anima (no sobre wrappers estáticos).
- Fancy UI primitives: `CardStack.tsx` (deck of stacked cards with GSAP — `items`/`maxVisible`/`cardWidth`/`overlap`/`spreadDeg`/`autoAdvance`/`intervalMs`/`pauseOnHover`/`showDots` props; fan geometry + swipe-to-change with GSAP, dots below to select), `TextLoop.tsx` (text flowing along an SVG path — `shape` circle/infinity/arch/line/wave, GSAP tween on `startOffset`), `Grainient.tsx` (animated WebGL gradient, requires `ogl`, renders a fullscreen triangle with a fragment shader, pauses when off-screen), `StickerTrail.tsx` (cursor-following sticker trail — spawns cloned `<img>`s from `/stickers/` in `public/` with the Web Animations API).
- No content collections or markdown.
- SEO: `@astrojs/sitemap` generates `sitemap-index.xml`; Astro's **native `prefetch` config** prefetches internal links (no `@astrojs/prefetch` package); favicon, logo and stickers live in `public/`. **Meta files (`robots.txt`, `site.webmanifest`) live at the project root** and are emitted to the site root by the custom `metaFiles()` integration in `astro.config.mjs` (`astro:build:done` hook) — do not move them into `public/`. Site URL is `https://vortex.agency` in `astro.config.mjs`.
- Security: a strict CSP meta tag is emitted only in production builds (`import.meta.env.PROD`) — do not enable it in dev or HMR breaks. `script-src 'self'` needs the two Astro island-bootstrap hashes present in `src/layouts/Layout.astro` (they are prebuilt strings, stable per Astro version — recompute them if Astro is upgraded); every other script is externalized by `build.assetsInlineLimit: 0` in `astro.config.mjs` — do not raise that limit or Astro 7 will inline leaf scripts (e.g. the header's) into the HTML and the strict CSP will block them, killing all React island hydration (no animations).

## Styling

- Tailwind CSS **v4** via `@tailwindcss/vite` plugin — there is no `tailwind.config.js` and one should not be created. Styles are layered in `src/styles/`: `theme.css` (design tokens via `@theme`), `base.css` (base layer, component classes, keyframes), and `global.css` (entry that imports tailwindcss + the other two).
- Brand colors are Tailwind tokens: `ink` (black), `cream`, `vortex` (#bc80bb purple), `vortex-blue`, `vortex-coral`, `vortex-green`, `hairline`. Use them as `bg-vortex`, `text-cream/60`, etc.
- Fonts: Geist + Geist Mono via Google Fonts (loaded in Layout). `font-mono` is used for kickers/labels.
- Custom classes: `.btn` (gradient primary), `.btn-dark`, `.kicker` (mono uppercase label), `.highlight-gradient` (purple→green text). Add new styles to `base.css`, not page styles.
- `gsap` (v3, with ScrollTrigger) is used for hero intro, scroll reveals and marquees.
