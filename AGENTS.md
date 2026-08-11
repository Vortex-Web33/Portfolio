# AGENTS.md

## Commands

- Package manager is **pnpm** (pnpm-lock.yaml, workspace file present). Node >= 22.12.0.
- Dev server: `astro dev --background` (Astro 7 background mode). Manage it with `astro dev stop`, `astro dev status`, `astro dev logs` (use `pnpm astro dev ...` to avoid relying on PATH).
- No tests, lint, or typecheck scripts. Verification is `pnpm build` (outputs to `dist/`, gitignored); `astro check` works for typechecking since tsconfig extends `astro/tsconfigs/strict`.

## Architecture

- Static multi-page Astro site, **all content in French**. Do not translate or anglicize copy.
- Each route is `src/pages/<slug>/index.astro`. Slugs are keyword-driven SEO URLs (e.g. `creation-site-internet-lyon`, `referencement-naturel-seo-lyon`) — never rename them.
- Header/nav/footer and all internal links are hardcoded in `src/layouts/Layout.astro`. New pages must be added to the nav there manually; every page passes `title` to `<Layout>` (rendered as `{title} - VORTEX`).
- No content collections or markdown; blog is a placeholder page.

## Styling

- Tailwind CSS **v4** via `@tailwindcss/vite` plugin — there is no `tailwind.config.js` and one should not be created. Theme customization goes in `src/styles/global.css` (CSS-first via `@theme`).
- The site is currently unstyled: markup uses semantic class names (`.site-header`, `.hero`, ...) with no definitions yet, and `global.css` only contains `@import "tailwindcss"`. Put new styles in `global.css` or page frontmatter-scoped `<style>` blocks.
- `gsap` is a dependency but not used anywhere yet.
