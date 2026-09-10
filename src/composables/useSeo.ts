import { useHead } from '@unhead/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSanity } from '@/composables/useSanity';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://advocateofshalom.com';
const siteName = 'Advocate Of SHALOM';
const siteLocation = 'Grand Junction, CO';
const siteDescription =
  'Holistic advocacy for individuals navigating the criminal justice system, reentry, and complex government agencies — based in Grand Junction, Colorado.';
const defaultImage = `${siteUrl}/og-image.png`;

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description:
      'Advocate Of SHALOM helps individuals navigate the criminal justice system and complex agencies — with a team that shows up when it matters most. Based in Grand Junction, CO.',
  },
  '/about': {
    title: 'About',
    description:
      "Learn about Advocate Of SHALOM — who we are, the mission behind the work, and why we're committed to standing up for those who need it most.",
  },
  '/contact': {
    title: 'Contact',
    description:
      "Whether you're seeking support or exploring a partnership, we'd love to hear from you. Reach out to Advocate Of SHALOM today.",
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description:
      'How Advocate Of SHALOM collects, uses, and protects your information. Read our full privacy policy.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description:
      'The terms of use governing your access to advocateofshalom.com — including intellectual property, disclaimers, and limitations of liability.',
  },
  '/accessibility': {
    title: 'Accessibility Statement',
    description:
      'Advocate Of SHALOM is committed to digital accessibility. Read our full accessibility statement and how to report barriers.',
  },
  '/services': {
    title: 'Services',
    description:
      'From criminal justice navigation to DHS advocacy, Advocate Of SHALOM provides coordinated support for individuals facing complex systems in Grand Junction and across Colorado.',
  },
  '/partners': {
    title: 'Partners',
    description:
      'Attorneys, social workers, and community providers — learn how partnering with Advocate Of SHALOM strengthens the support network for shared clients.',
  },
  '/resources': {
    title: 'Resources',
    description:
      'Guides, links, and practical information to help individuals and professionals navigate the criminal justice system and complex government agencies in Colorado.',
  },
};

export function useSeo() {
  const route = useRoute();

  // Pull social profile URLs from Sanity for JSON-LD sameAs.
  const { data: socialData } = useSanity<Array<{ url: string }>>(
    `*[_type == "socialLinks"] | order(order asc, _createdAt asc) { url }`
  );

  const meta = computed(() => pageMeta[route.path] || {
    title: siteName,
    description: siteDescription,
  });

  // Titles read: "{Page} | Advocate Of SHALOM | Grand Junction, CO"
  // Falls back to just the site name + location when a page uses the site name
  // as its title (e.g. the home fallback).
  const fullTitle = computed(() => {
    const t = meta.value.title;
    if (t === siteName || t.includes(siteName)) return `${siteName} | ${siteLocation}`;
    return `${t} | ${siteName} | ${siteLocation}`;
  });

  const canonicalUrl = computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`);

  // Reactive JSON-LD — packages ProfessionalService, WebSite, and (where
  // applicable) BreadcrumbList into a single schema.org @graph so Google
  // sees the relationships between the site, the business, and the current
  // page's position in the hierarchy. Using @graph over separate scripts
  // is Google's recommended pattern when a page carries multiple entities.
  const jsonLd = computed(() => {
    const sameAs = (socialData.value ?? [])
      .map((s) => s?.url)
      .filter((u): u is string => typeof u === 'string' && u.length > 0);

    const orgId = `${siteUrl}#organization`;
    const websiteId = `${siteUrl}#website`;

    const organization: Record<string, unknown> = {
      '@type': 'ProfessionalService',
      '@id': orgId,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      logo: `${siteUrl}/apple-touch-icon.png`,
      image: defaultImage,
      email: 'navigator@advocateofshalom.com',
      telephone: '9707735907',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '536 31 1/2 Rd #1',
        addressLocality: 'Grand Junction',
        addressRegion: 'CO',
        postalCode: '81504',
        addressCountry: 'US',
      },
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Grand Valley, Colorado',
      },
      // "Free consultation" phrasing tells Google + prospects the service
      // is accessible without money as a first barrier. Rich Results flagged
      // priceRange as missing (optional). "$" widely reads as "affordable
      // range" without committing to a specific number.
      priceRange: '$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '17:00',
        },
      ],
    };

    if (sameAs.length > 0) organization.sameAs = sameAs;

    const website = {
      '@type': 'WebSite',
      '@id': websiteId,
      name: siteName,
      url: siteUrl,
      publisher: { '@id': orgId },
      inLanguage: 'en-US',
    };

    const graph: Array<Record<string, unknown>> = [organization, website];

    // Breadcrumb only when we're not on the home page and the current
    // route matches a known page. Skips 404 and dynamic slug routes
    // where we'd otherwise emit a breadcrumb pointing at a title we
    // don't know. Flat 2-level hierarchy (Home > Page) matches the
    // site's structure — no nested categories.
    const currentPage = pageMeta[route.path];
    if (route.path !== '/' && currentPage) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: currentPage.title,
            item: `${siteUrl}${route.path}`,
          },
        ],
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  });

  useHead({
    title: fullTitle,
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    meta: [
      { name: 'description', content: computed(() => meta.value.description) },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: computed(() => meta.value.description) },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: defaultImage },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: computed(() => meta.value.description) },
      { name: 'twitter:image', content: defaultImage },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() => JSON.stringify(jsonLd.value)),
      },
    ],
  });
}
