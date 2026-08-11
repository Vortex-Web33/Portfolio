# AGENTS.md

## Commands

- Package manager is **pnpm** (pnpm-lock.yaml, workspace file present). Node >= 22.12.0.
- Dev server: `astro dev --background` (Astro 7 background mode). Manage it with `astro dev stop`, `astro dev status`, `astro dev logs` (use `pnpm astro dev ...` to avoid relying on PATH).
- No tests, lint, or typecheck scripts. Verification is `pnpm build` (outputs to `dist/`, gitignored); typechecking is `pnpm astro check` (requires typescript 6.x — TS 7 breaks it).

## Architecture

- Static multi-page Astro site, **all content in Spanish** (Spanish agency site, not the French reference site). Do not translate or anglicize copy.
- Routes live in `src/pages/<slug>.astro` (flat files). Slugs are keyword-driven SEO URLs — never rename them. Currently the site ships with a single route (`index.astro`); add pages here following the same flat pattern.
- `src/components/App.astro` is the **parent component** — it imports and composes the page sections (the "routes" of the app). Pages import `<App />` and stay as thin route definitions (`Layout` + `App`).
- Site config (brand, contact, address, socials) lives in `src/config/site.ts` — edit copy/data there, not in components.
- Shared TypeScript contracts (Service, Project, site config types) live in `src/types/index.ts`. Data files (`src/data/*.ts`) import these types.
- Content data (services, projects, clients) lives in `src/data/*.ts` as typed arrays.
- Components are organized:
  - `src/sections/` → **repetitive blocks** (`Header.astro`, `Footer.astro`, `Hero.astro`, `ClientsMarquee.astro`, `IntroSection.astro`, `AgencySection.astro`, `CTASection.astro`, `PageHero.astro`, `ProjectsSection.astro`, `ServicesSection.astro`, `ContactSection.astro`, `BigWordsMarquee.astro`) — all in Astro, they are the markup/design of the page
  - `src/seo/` → `SEO.astro` (meta/OG/Twitter/JSON-LD) — used on every page, lives outside `components/` (it is page metadata, not a visual block)
  - `src/components/ui/` → **primitives with logic in React/JSX** (`Button.tsx`, `Marquee.tsx`, `Reveal.tsx`, `TextLoop.tsx`, `Grainient.tsx`, `StickerTrail.tsx`) + static ones in Astro (`Container.astro`) — no business logic
  - Rule: a block used on one page stays in `sections/`; if a route needs its own private blocks, group them under `src/components/page/<route>/` and import them from the page.
- **React + TypeScript only for UI primitives that need logic** (animations, interactivity): pages, layouts and sections stay `.astro` (fast static HTML); sections import the React primitives with `client:load` (e.g. `<Reveal client:load />` in `Hero.astro`). Animation logic lives inside each React primitive (GSAP in `useLayoutEffect`, cleanup + kill on unmount, `prefers-reduced-motion` guard). `@astrojs/react` with `react-jsx` (`tsconfig.json`).
- `src/layouts/Layout.astro` wires global.css, SEO and Header/Footer. Every page passes `title`/`description` to `<Layout>`.
- Animations (GSAP) are per-component, no global bootstrap script. `Reveal.tsx` (scroll reveal with ScrollTrigger, `as`/`delay`/`trigger` props; `trigger="mount"` for entrance-on-load) and `Marquee.tsx` (loop marquee, `direction`/`speed` props) are the shared animated primitives. `Header.astro` has a small vanilla `<script>` for the `scrolled` state (no React needed for that).
- Fancy UI primitives: `TextLoop.tsx` (text flowing along an SVG path — `shape` circle/infinity/arch/line/wave, GSAP tween on `startOffset`), `Grainient.tsx` (animated WebGL gradient, requires `ogl`, renders a fullscreen triangle with a fragment shader, pauses when off-screen or `prefers-reduced-motion`), `StickerTrail.tsx` (cursor-following sticker trail — spawns cloned `<img>`s from `/stickers/` in `public/` with the Web Animations API, guarded by reduced motion).
- No content collections or markdown.
- SEO: `@astrojs/sitemap` generates `sitemap-index.xml`; Astro's **native `prefetch` config** prefetches internal links (no `@astrojs/prefetch` package); favicon, logo and stickers live in `public/`. **Meta files (`robots.txt`, `site.webmanifest`) live at the project root** and are emitted to the site root by the custom `metaFiles()` integration in `astro.config.mjs` (`astro:build:done` hook) — do not move them into `public/`. Site URL is `https://vortex.agency` in `astro.config.mjs`.
- Security: a strict CSP meta tag is emitted only in production builds (`import.meta.env.PROD`) — do not enable it in dev or HMR breaks.

## Styling

- Tailwind CSS **v4** via `@tailwindcss/vite` plugin — there is no `tailwind.config.js` and one should not be created. Styles are layered in `src/styles/`: `theme.css` (design tokens via `@theme`), `base.css` (base layer, component classes, keyframes), and `global.css` (entry that imports tailwindcss + the other two).
- Brand colors are Tailwind tokens: `ink` (black), `cream`, `vortex` (#bc80bb purple), `vortex-blue`, `vortex-coral`, `vortex-green`, `hairline`. Use them as `bg-vortex`, `text-cream/60`, etc.
- Fonts: Geist + Geist Mono via Google Fonts (loaded in Layout). `font-mono` is used for kickers/labels.
- Custom classes: `.btn` (gradient primary), `.btn-dark`, `.kicker` (mono uppercase label), `.highlight-gradient` (purple→green text). Add new styles to `base.css`, not page styles.
- `gsap` (v3, with ScrollTrigger) is used for hero intro, scroll reveals and marquees.
