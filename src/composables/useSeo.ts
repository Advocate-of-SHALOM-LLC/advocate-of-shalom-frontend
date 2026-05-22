import { useHead } from '@unhead/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://advocateofshalom.net';
const siteName = 'Advocate Of Shalom';
const defaultImage = `${siteUrl}/og-image.png`;

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description: 'Advocacy of Shalom helps individuals navigate the criminal justice system and complex agencies — with a team that shows up when it matters most.',
  },
  '/about': {
    title: 'About',
    description: 'Learn about Advocacy of Shalom — who we are, the mission behind the work, and why we\'re committed to standing up for those who need it most.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Whether you\'re seeking support or exploring a partnership, we\'d love to hear from you. Reach out to Advocacy of Shalom today.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Privacy Policy - Advocate Of Shalom',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Terms & Conditions - Advocate Of Shalom',
  },
  '/accessibility': {
    title: 'Accessibility Statement',
    description: 'Accessibility Statement - Advocate Of Shalom',
  },
  '/services': {
    title: 'Services',
    description: 'From criminal justice navigation to DHS advocacy, Advocacy of Shalom provides coordinated support for individuals facing complex systems.',
  },
  '/partners': {
    title: 'Partners',
    description: 'Attorneys, social workers, and community providers — learn how partnering with Advocacy of Shalom strengthens the support network for shared clients.',
  },
  '/resources': {
    title: 'Resources',
    description: 'Guides, links, and practical information to help individuals and professionals navigate the criminal justice system and complex government agencies.',
  },
};

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Advocate Of Shalom",
  "url": "https://advocateofshalom.net",
  "email": "eparker@advocateofshalom.net",
  "telephone": "9703147095",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "536 31 1/2 Rd #1",
    "addressLocality": "Grand Junction",
    "addressRegion": "CO",
    "postalCode": "81501",
    "addressCountry": "US"
  }
};

export function useSeo() {
  const route = useRoute();

  const meta = computed(() => pageMeta[route.path] || {
    title: siteName,
    description: 'Purpose-driven solutions from ' + siteName + '.',
  });

  const fullTitle = computed(() => {
    const t = meta.value.title;
    return t.includes(siteName) ? t : `${t} | ${siteName}`;
  });

  const canonicalUrl = computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`);

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
        innerHTML: JSON.stringify(schemaJsonLd),
      },
    ],
  });
}
