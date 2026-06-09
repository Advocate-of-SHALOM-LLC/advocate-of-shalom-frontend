export interface NavItem {
  label: string;
  to: string;
}

/**
 * Hierarchical nav item used by headers that support accordion / dropdown menus.
 * Items with `children` render as expandable sections; without, as direct links.
 */
export interface HeaderNavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export interface PageMeta {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

export interface SiteConfig {
  name: string;
  logoLight: string;
  logoDark: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  ctaLabel: string;
  ctaUrl: string;
  ctaHeadline: string;
  ctaSubtext: string;
  ctaFooterLabel: string;
  ctaFooterUrl: string;
  copyrightText: string;
  description: string;
  craftedBy: string;
  primaryNav: NavItem[];
  footerNav: NavItem[];
  legalNav: NavItem[];
  socialLinks: { platform: string; url: string }[];
  // Optional — populated when a header variant supports hierarchical nav
  // (e.g. HeaderTransparentJC with accordion sections)
  headerNav?: HeaderNavItem[];
  volunteerUrl?: string;
  donateUrl?: string;
}
