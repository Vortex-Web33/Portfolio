# AGENTS.md

## Commands

- Package manager is **pnpm** (pnpm-lock.yaml, workspace file present). Node >= 22.12.0.
- Dev server: `astro dev --background` (Astro 7 background mode). Manage it with `astro dev stop`, `astro dev status`, `astro dev logs` (use `pnpm astro dev ...` to avoid relying on PATH).
- No tests, lint, or typecheck scripts. Verification is `pnpm build` (outputs to `dist/`, gitignored); typechecking is `pnpm astro check` (requires typescript 6.x — TS 7 breaks it).

## Architecture

- Static multi-page Astro site, **all content in Spanish** (Spanish agency site, not the French reference site). Do not translate or anglicize copy.
- Each route is `src/pages/<slug>/index.astro`. Slugs are keyword-driven SEO URLs (e.g. `creacion-sitios-web`, `posicionamiento-seo-lyon`, `agencia-web-lyon`) — never rename them.
- Site config (brand, contact, address, nav, socials) lives in `src/config/site.ts` — edit copy/data there, not in components.
- Shared TypeScript contracts (Service, Project, PricingPlan, NavItem, site config types) live in `src/types/index.ts`. Data files (`src/data/*.ts`) import these types.
- Content data (services, projects, clients, pricing) lives in `src/data/*.ts` as typed arrays. Services pages are driven by `src/data/services.ts` (add a feature/service there).
- Components are organized:
  - `src/components/layout/` → `Header.astro`, `Footer.astro` (nav built from `site.ts`)
  - `src/components/seo/` → `SEO.astro` (meta/OG/Twitter/JSON-LD), `ServiceSchema.astro`
  - `src/components/sections/` → page sections (`Hero`, `PageHero`, `ProjectsSection`, `ServicesSection`, `PricingSection`, `ContactSection`, ...)
  - `src/components/ui/` → primitives (`Container`, `Button`, `Marquee`, `SectionHeading`)
- `src/layouts/Layout.astro` wires global.css, SEO, Header/Footer and the animation bootstrap. Every page passes `title`/`description` to `<Layout>`.
- Animations (GSAP) live in `src/scripts/animations.ts` and attach to `[data-hero-anim]`, `[data-reveal]`, `[data-marquee]` hooks. Respects `prefers-reduced-motion`.
- No content collections or markdown; blog is a placeholder page.
- SEO: `@astrojs/sitemap` generates `sitemap-index.xml` (excludes `/aviso-legal/`); `@astrojs/prefetch` prefetches internal links; robots.txt, `site.webmanifest` and favicon live in `public/`. Site URL is `https://vortex.agency` in `astro.config.mjs`.
- Security: a strict CSP meta tag is emitted only in production builds (`import.meta.env.PROD`) — do not enable it in dev or HMR breaks.

## Styling

- Tailwind CSS **v4** via `@tailwindcss/vite` plugin — there is no `tailwind.config.js` and one should not be created. Styles are layered in `src/styles/`: `theme.css` (design tokens via `@theme`), `base.css` (base layer, component classes, keyframes), and `global.css` (entry that imports tailwindcss + the other two).
- Brand colors are Tailwind tokens: `ink` (black), `cream`, `vortex` (#bc80bb purple), `vortex-blue`, `vortex-coral`, `vortex-green`, `hairline`. Use them as `bg-vortex`, `text-cream/60`, etc.
- Fonts: Geist + Geist Mono via Google Fonts (loaded in Layout). `font-mono` is used for kickers/labels.
- Custom classes: `.btn` (gradient primary), `.btn-dark`, `.kicker` (mono uppercase label), `.highlight-gradient` (purple→green text). Add new styles to `global.css`, not page styles.
- `gsap` (v3, with ScrollTrigger) is used for hero intro, scroll reveals and marquees.
