<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '@/stores/useSiteStore';
import { useSanity } from '@/composables/useSanity';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-vue-next';
import type { Component } from 'vue';

const site = useSiteStore();
const year = new Date().getFullYear();

// ── Footer columns from Sanity ─────────────────────────────────────────
interface FooterLink {
  label: string;
  url: string;
}
interface FooterColumn {
  title: string;
  order: number;
  links: FooterLink[];
}
const { data: sanityColumns } = useSanity<FooterColumn[]>(
  `*[_type == "footerColumns"] | order(order asc, _createdAt asc) {
    title,
    order,
    links[]{ label, url }
  }`
);

// Hardcoded fallback — used if Sanity has no footerColumns yet, so the footer
// never appears broken even with an empty CMS.
const fallbackColumns = computed<FooterColumn[]>(() => [
  {
    title: 'Explore',
    order: 1,
    links: site.footerNav.map((n) => ({ label: n.label, url: n.to })),
  },
  {
    title: 'Legal',
    order: 2,
    links: site.legalNav.map((n) => ({ label: n.label, url: n.to })),
  },
]);

const columns = computed<FooterColumn[]>(() => {
  const fromSanity = sanityColumns.value;
  if (Array.isArray(fromSanity) && fromSanity.length > 0) return fromSanity;
  return fallbackColumns.value;
});

function isExternal(url: string) {
  return /^(https?:)?\/\//.test(url);
}

// ── Social links from Sanity ───────────────────────────────────────────
interface SocialLink {
  platform: string;
  url: string;
  order: number;
}
const { data: sanitySocial } = useSanity<SocialLink[]>(
  `*[_type == "socialLinks"] | order(order asc, _createdAt asc) {
    platform,
    url,
    order
  }`
);

const socialLinks = computed<SocialLink[]>(() => {
  const arr = sanitySocial.value;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((l) => l && l.platform && l.url)
    .map((l) => ({ ...l, platform: l.platform.toLowerCase() }));
});

const lucideMap: Record<string, Component> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};
const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};
</script>

<template>
  <footer class="site-footer">
    <!-- Stacked dark area: brand + link columns + social -->
    <div class="stack">
      <div class="stack__inner">
        <div class="stack__cols">
          <!-- Brand column: org name + description + social row -->
          <div class="stack__brand">
            <p class="stack__name">{{ site.name }}</p>
            <p v-if="site.description" class="stack__desc">{{ site.description }}</p>

            <div v-if="socialLinks.length" class="stack__social">
              <a
                v-for="link in socialLinks"
                :key="link.platform + link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="stack__social-link"
                :aria-label="platformLabels[link.platform] || link.platform"
              >
                <component
                  v-if="lucideMap[link.platform]"
                  :is="lucideMap[link.platform]"
                  :size="18"
                  stroke-width="2"
                />
                <span v-else-if="link.platform === 'tiktok'" class="stack__social-text-mark" aria-hidden="true">TK</span>
                <span v-else class="stack__social-text-mark" aria-hidden="true">{{ link.platform.charAt(0).toUpperCase() }}</span>
              </a>
            </div>
          </div>

          <!-- Link columns wrapper: row of dynamic columns -->
          <div class="stack__col-group">
            <nav
              v-for="col in columns"
              :key="col.title"
              class="stack__col"
              :aria-label="col.title"
            >
              <h2 class="stack__col-heading">{{ col.title }}</h2>
              <ul class="stack__list">
                <li v-for="link in col.links || []" :key="link.url">
                  <a
                    v-if="isExternal(link.url)"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="stack__link"
                  >
                    {{ link.label }}
                  </a>
                  <RouterLink v-else :to="link.url" class="stack__link">
                    {{ link.label }}
                  </RouterLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar: copyright + crafted-by -->
    <div class="bottom-bar">
      <div class="bottom-bar__inner">
        <p class="bottom-bar__copyright">
          {{ site.copyrightText || `© ${year} ${site.name}. All rights reserved.` }}
        </p>
        <p class="bottom-bar__crafted">
          Crafted by
          <a
            href="https://phiferwebsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            class="bottom-bar__crafted-link"
          >Phifer Web Solutions</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: auto;
}

/* ─── Stacked dark area ─── */
.stack {
  background-color: #0d1b30;
  padding: 4rem 1.5rem 3rem;
}

.stack__inner {
  max-width: 72rem;
  margin: 0 auto;
}

.stack__cols {
  display: grid;
  grid-template-columns: 1fr; /* mobile: single column, everything stacks */
  gap: 2.5rem;
  margin-bottom: 0;
}

@media (min-width: 768px) {
  .stack__cols {
    /* Brand column gets 1fr, link-column group gets 2fr. Side-by-side. */
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
  }
}

/* Brand column */
.stack__brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stack__name {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.stack__desc {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #d1d5db;
  max-width: 32rem;
  margin: 0;
}

/* Link columns wrapper — stacks on mobile, row on desktop */
.stack__col-group {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .stack__col-group {
    flex-direction: row;
    gap: 3rem;
  }
}

.stack__col {
  flex: 1;
  min-width: 0;
}

/* Link columns */
.stack__col-heading {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin-bottom: 1rem;
}

.stack__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.stack__link {
  font-size: 0.9375rem;
  color: #d1d5db;
  transition: color 0.2s ease;
  border-radius: 2px;
  text-decoration: none;
}

.stack__link:hover {
  color: #ffffff;
}

.stack__link:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

/* Social row (sits inside the brand column) */
.stack__social {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.stack__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #d1d5db;
  transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.stack__social-link:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-1px);
}

.stack__social-link:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.stack__social-text-mark {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* ─── Bottom bar ─── */
.bottom-bar {
  background-color: #000000;
  padding: 1.25rem 1.5rem;
}

.bottom-bar__inner {
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.bottom-bar__copyright,
.bottom-bar__crafted {
  font-size: 0.875rem;
  color: #d1d5db;
  margin: 0;
}

.bottom-bar__crafted-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.bottom-bar__crafted-link:hover {
  color: #ffffff;
}

.bottom-bar__crafted-link:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .bottom-bar__inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
