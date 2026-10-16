/**
 * GROQ queries needed on every first paint, kept in one place so main.ts can
 * start them (prefetchSanity) with exactly the strings the components use.
 * Kept free of component imports so main.ts stays small.
 */

// coalesce(logoLight, logo) lets legacy data on the old `logo` field still resolve
// until the editor moves it to `logoLight`. Same for `logoDark` ← `darkLogo`.
export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
    siteName,
    "logoLight": coalesce(logoLight, logo){asset->{url}},
    "logoDark": coalesce(logoDark, darkLogo){asset->{url}},
    ctaLabel,
    ctaUrl,
    ctaHeadline,
    ctaSubtext,
    ctaFooterLabel,
    ctaFooterUrl,
    copyrightText,
    description,
    craftedBy
  }`

export const NAVIGATION_QUERY = `*[_type == "navigation"]{navType, items[]{label, url, isExternal}}`

/** GROQ query — just fetch the whole page document with sections */
export const pageQuery = (slug: string) =>
  `*[_type == "page" && slug.current == "${slug}"][0]{ title, "slug": slug.current, sections }`
