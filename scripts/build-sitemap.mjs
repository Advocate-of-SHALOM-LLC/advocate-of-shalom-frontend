#!/usr/bin/env node
// Regenerates public/sitemap.xml with today's date on every build. Called as
// a prebuild step from package.json so the shipped sitemap always tells
// search engines the site was recently updated.
//
// Runs standalone: `node scripts/build-sitemap.mjs`

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const siteUrl = process.env.VITE_SITE_URL || 'https://advocateofshalom.com';
const today = new Date().toISOString().split('T')[0];

// Route table — keep in sync with src/router/index.ts.
// Legal pages get a lower priority and yearly changefreq since they change
// rarely; content pages are monthly.
const routes = [
  { path: '/',                      priority: '1.0', changefreq: 'monthly' },
  { path: '/about',                 priority: '0.8', changefreq: 'monthly' },
  { path: '/services',              priority: '0.8', changefreq: 'monthly' },
  { path: '/partners',              priority: '0.8', changefreq: 'monthly' },
  { path: '/resources',             priority: '0.8', changefreq: 'monthly' },
  { path: '/contact',               priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy-policy',        priority: '0.3', changefreq: 'yearly' },
  { path: '/terms-and-conditions',  priority: '0.3', changefreq: 'yearly' },
  { path: '/accessibility',         priority: '0.3', changefreq: 'yearly' },
];

const urlEntries = routes
  .map(
    (r) => `  <url>
    <loc>${siteUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(join(publicDir, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml regenerated: ${routes.length} URLs, lastmod=${today}`);
