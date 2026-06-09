<script setup>
import { computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useRevealObserver } from '@/composables/useRevealObserver';
import HeroSection from '@/components/sections/HeroSection.vue';
import SmartLink from '@/components/ui/SmartLink.vue';
import { getLucideIcon } from '@/composables/useLucideIcons';

const resourcesQuery = `*[_type == "resourcesPage"][0]{
  heroTitle, heroSubtitle, heroCta, heroImage, heroImageAlt,
  resourcesIntroHeading, resourcesIntroBody,
  resourcesHeading, resourcesSubheading,
  resources[]{ _key, title, description, icon, url },
  resourcesSplitHeading, resourcesSplitBody, resourcesSplitFeatures,
  resourcesSplitCtaLabel, resourcesSplitCtaUrl,
  resourcesCtaHeadline, resourcesCtaText, resourcesCtaButtonLabel, resourcesCtaButtonUrl
}`;

const { data: page } = useSanity(resourcesQuery);
useRevealObserver(page);

const heroSection = computed(() => {
  if (!page.value) return null;
  return {
    _type: 'heroSection',
    title: page.value.heroTitle,
    subtitle: page.value.heroSubtitle,
    cta:
      page.value.heroCta?.label && page.value.heroCta?.url
        ? { label: page.value.heroCta.label, url: page.value.heroCta.url }
        : null,
    image: page.value.heroImage,
    imageAlt: page.value.heroImageAlt,
  };
});

const resources = computed(() => page.value?.resources || []);
const splitFeatures = computed(() => page.value?.resourcesSplitFeatures || []);

function isExternalUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'));
}
</script>

<template>
  <main class="page page--resources">
    <!-- 1. BlockHero -->
    <HeroSection v-if="heroSection" :section="heroSection" />

    <!-- 2. BlockText -->
    <section
      v-if="page?.resourcesIntroHeading || page?.resourcesIntroBody"
      class="reveal py-16 px-6 resources-text"
    >
      <div class="max-w-3xl mx-auto text-center">
        <h2 v-if="page?.resourcesIntroHeading" class="text-3xl font-bold mb-6 text-(--color-text)">
          {{ page.resourcesIntroHeading }}
        </h2>
        <p
          v-if="page?.resourcesIntroBody"
          class="text-lg text-(--color-text-secondary) whitespace-pre-line leading-relaxed"
        >
          {{ page.resourcesIntroBody }}
        </p>
      </div>
    </section>

    <!-- 3. BlockServices — resource categories -->
    <section v-if="resources.length || page?.resourcesHeading" class="reveal py-16 px-6 resources-list">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 v-if="page?.resourcesHeading" class="text-3xl font-bold text-(--color-text) mb-3">
            {{ page.resourcesHeading }}
          </h2>
          <p v-if="page?.resourcesSubheading" class="text-lg text-(--color-text-secondary)">
            {{ page.resourcesSubheading }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          <article
            v-for="res in resources"
            :key="res._key"
            class="resource-card"
            :class="{ 'resource-card--linked': !!res.url }"
          >
            <component
              :is="getLucideIcon(res.icon)"
              class="resource-card__icon w-8 h-8 text-(--color-primary)"
              :stroke-width="1.5"
              aria-hidden="true"
            />
            <h3 class="resource-card__title">{{ res.title }}</h3>
            <p v-if="res.description" class="resource-card__desc">{{ res.description }}</p>
            <SmartLink
              v-if="res.url"
              :to="res.url"
              class="resource-card__link"
              :aria-label="`Visit ${res.title}`"
            >
              <span>{{ isExternalUrl(res.url) ? 'Visit' : 'Learn more' }}</span>
              <span aria-hidden="true" class="resource-card__arrow">→</span>
            </SmartLink>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. BlockSplit — Callout / Reach Out -->
    <section
      v-if="page?.resourcesSplitHeading || page?.resourcesSplitBody"
      class="reveal py-16 px-6 resources-split"
    >
      <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <h2 v-if="page?.resourcesSplitHeading" class="text-3xl font-bold mb-5 text-(--color-text)">
            {{ page.resourcesSplitHeading }}
          </h2>
          <p v-if="page?.resourcesSplitBody" class="text-(--color-text-secondary) mb-6 leading-relaxed">
            {{ page.resourcesSplitBody }}
          </p>
          <SmartLink
            v-if="page?.resourcesSplitCtaLabel && page?.resourcesSplitCtaUrl"
            :to="page.resourcesSplitCtaUrl"
            class="resources-split__button focus-ring inline-flex items-center font-semibold px-6 py-3 rounded-lg"
          >
            {{ page.resourcesSplitCtaLabel }}
          </SmartLink>
        </div>

        <ul v-if="splitFeatures.length" class="resources-split__list">
          <li v-for="(feature, i) in splitFeatures" :key="i">
            <span class="resources-split__check" aria-hidden="true">✓</span>
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 5. BlockCta -->
    <section
      v-if="page?.resourcesCtaHeadline || page?.resourcesCtaButtonLabel"
      class="reveal-scale py-20 px-6 text-center resources-cta"
    >
      <div class="max-w-2xl mx-auto">
        <h2 v-if="page?.resourcesCtaHeadline" class="text-3xl md:text-4xl font-bold mb-4 resources-cta__heading">
          {{ page.resourcesCtaHeadline }}
        </h2>
        <p v-if="page?.resourcesCtaText" class="text-lg mb-8 resources-cta__text">
          {{ page.resourcesCtaText }}
        </p>
        <SmartLink
          v-if="page?.resourcesCtaButtonLabel && page?.resourcesCtaButtonUrl"
          :to="page.resourcesCtaButtonUrl"
          class="focus-ring-light inline-block font-semibold px-8 py-3 rounded-lg transition-colors resources-cta__button"
        >
          {{ page.resourcesCtaButtonLabel }}
        </SmartLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ─── Block backgrounds for visual rhythm ───────────────────────────── */
.resources-text {
  background-color: var(--color-bg);
}
.resources-list {
  background-color: var(--color-bg-secondary);
}
.resources-split {
  background-color: var(--color-bg);
}

/* ─── Resource cards ────────────────────────────────────────────────── */
.resource-card {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.resource-card--linked:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.resource-card__icon {
  margin-bottom: 0.5rem;
}

.resource-card__title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.resource-card__desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
  flex: 1;
}

.resource-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary);
  align-self: flex-start;
  border-radius: 2px;
  transition: color 0.2s ease, gap 0.2s ease;
}

.resource-card__link:hover {
  color: var(--color-primary-hover);
  gap: 0.65rem;
}

.resource-card__link:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: 4px;
}

.resource-card__arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}

.resource-card__link:hover .resource-card__arrow {
  transform: translateX(2px);
}

/* ─── Split / Callout ───────────────────────────────────────────────── */
.resources-split__button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.resources-split__button:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-text-inverse);
  transform: translateY(-1px);
}

.resources-split__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.resources-split__list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 1rem;
  color: var(--color-text);
  line-height: 1.5;
}

.resources-split__check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: color-mix(in srgb, var(--color-success) 18%, transparent);
  color: var(--color-success);
  font-weight: 700;
  font-size: 0.875rem;
  margin-top: 0.125rem;
}

/* ─── Closing CTA ───────────────────────────────────────────────────── */
.resources-cta {
  background-color: var(--color-primary);
}

.resources-cta__heading,
.resources-cta__text {
  color: var(--color-text-inverse);
}

.resources-cta__text {
  opacity: 0.9;
}

.resources-cta__button {
  background-color: var(--color-text-inverse);
  color: var(--color-primary);
}

.resources-cta__button:hover {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}
</style>
