import { defineStore } from 'pinia';
import type { SiteConfig } from '@/types/site';

export const useSiteStore = defineStore('site', {
  state: (): SiteConfig => ({
    name: 'Advocate Of SHALOM',
    logoLight: '',
    logoDark: '',
    tagline: '',
    contactEmail: 'navigator@advocateofshalom.com',
    contactPhone: '',
    address: '',
    ctaLabel: 'Get Started',
    ctaUrl: '/contact',
    ctaHeadline: 'Ready to get started?',
    ctaSubtext: 'Let\'s build something great together.',
    ctaFooterLabel: '',
    ctaFooterUrl: '',
    copyrightText: '',
    description: '',
    craftedBy: '',
    primaryNav: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Services', to: '/services' },
    ],
    footerNav: [
      { label: 'Partners', to: '/partners' },
      { label: 'Resources', to: '/resources' },
    ],
    legalNav: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-and-conditions' },
      { label: 'Accessibility Statement', to: '/accessibility' },
    ],
    socialLinks: [],
  }),
});
