# Advocate Of SHALOM — Frontend

Public marketing site for **Advocate Of SHALOM**, a Grand Junction, CO criminal-justice and reentry advocacy practice. Fetches content from Sanity at runtime; deployed via Netlify.

Originally generated from `pws-foundation-template` and customized from there.

## Stack

- **Vite + Vue 3 + TypeScript**
- **Tailwind CSS 4** (CSS variables for theme tokens; canonical `text-(--color-x)` syntax)
- **Vue Router** for client-side routing
- **Pinia** for site-wide config state
- **Lucide Vue Next** for icons (string-keyed registry in `src/composables/useLucideIcons.ts`)
- **@unhead/vue** for per-page meta tags + JSON-LD
- **Sanity client** (via `useSanity` composable) for CMS data
- **Resend** for contact-form email delivery (Netlify Function)

## Local development

```bash
npm install
npm run dev
```

Required env vars in `.env`:

```
VITE_SANITY_PROJECT_ID=vi40cipr
VITE_SANITY_DATASET=production
VITE_SITE_URL=http://localhost:5173   # used by canonical URLs + OG image
```

Contact form requires Netlify Functions running locally:

```bash
npx netlify dev
```

And in `.env` (server-side, not VITE_):

```
RESEND_API_KEY=<from resend.com dashboard>
CONTACT_TO_EMAIL=<recipient>
CONTACT_FROM_EMAIL=<verified Resend sender>
```

## Project structure

```
src/
  components/
    layout/        SiteHeader, SiteFooter, SiteLayout, LegalPage
    layout/headers, layout/footers/    variant components
    sections/      HeroSection, FeatureGrid, ProcessSteps, TextContent,
                   SplitSection, PricingCtaSection, TestimonialsSection,
                   VideoSection, FaqSection, ContactSection, …
    ui/            SmartLink, FloatingVersionToggle, BaseButton, BaseCard
  composables/     useSanity, useSanityImage, useSeo, useTheme,
                   useStoryVersion, useLucideIcons, useSocialIcons,
                   useSections, useRevealObserver
  pages/           Home, About, Contact, Partners, Services, Resources,
                   NotFound, ProjectDetail, TeamProjectDetail
  pages/legal/     PrivacyPolicy, TermsAndConditions, AccessibilityStatement
                   (thin wrappers around components/layout/LegalPage.vue)
  stores/          useSiteStore (name, contact, nav, social, etc.)
  router/          route definitions
  types/           SiteConfig, NavItem, PageMeta, HeaderNavItem
  assets/styles/   main.css (Tailwind import + base layer), theme.css (CSS vars),
                   scroll-animations.css

netlify/
  functions/
    send-message.ts   contact form → Resend
    trigger-deploy.ts  Studio Deploy Site button → Netlify build hook

public/
  swallows.svg                   hero ambience overlay
  advocate-of-shalom-logo-1769x590.png   wordmark + birds, navy
  apple-touch-icon.png           180×180 iOS home-screen icon
  og-image.png                   1200×630 social share image
  favicon.ico, robots.txt, sitemap.xml
```

## Content flow

Every page fetches Sanity content via `useSanity()` (cached per query, no-cache fetch endpoint so Studio edits show up immediately). The five dedicated page singletons (`aboutPage`, `partnersPage`, `servicesPage`, `resourcesPage`, `contactPage`) carry flat fields per block. The home page uses the generic `page` schema with a `sections[]` array driven by `useSections.sectionMap`.

Theme switches via `useTheme` (toggles `data-theme="dark"` on `<html>`). Logos swap between `site.logoLight` and `site.logoDark` based on theme.

## Deploy

Pushed to Netlify automatically on `main`. The Sanity Studio also has a manual "Deploy Site" button that POSTs to `netlify/functions/trigger-deploy`, which hits a Netlify build hook — lets editors batch CMS changes and publish in one build.

## Notes

- All UI colors via CSS variables (defined in `src/assets/styles/theme.css`). Two themes: light (default) and dark (`[data-theme="dark"]`).
- Hero images respect Sanity hotspot via `object-position` / `background-position` computed from `img.hotspot.{x,y}`.
- The About page has an A/B story-version toggle (Full / Professional) — temporary preview tool, controlled per-visitor via `localStorage`. Remove `FloatingVersionToggle` from `pages/About.vue` once the client picks a version.
