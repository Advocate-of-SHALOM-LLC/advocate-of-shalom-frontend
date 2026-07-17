<script setup>
import { computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useRevealObserver } from '@/composables/useRevealObserver';
import { sanityImage } from '@/composables/useSanityImage';
import HeroSection from '@/components/sections/HeroSection.vue';
import SmartLink from '@/components/ui/SmartLink.vue';

// The About page renders the Professional Framing version only. The Sanity
// schema still carries the Full/Alludes duplicates + storyVersion toggle
// (kept in place for editorial flexibility), but the frontend ignores them.
const aboutQuery = `*[_type == "aboutPage"][0]{
  heroImage,
  heroImageAlt,
  heroHeadlineAlludes,
  heroSubheadlineAlludes,
  originStoryAlludes,
  teamBioImage,
  teamBioImageAlt,
  teamBioAlludes,
  approachHeading, approachBody,
  whoWeServeHeading, whoWeServeBody,
  ctaHeading, ctaSubline, ctaButtonLabel, ctaButtonUrl
}`;

const { data: page } = useSanity(aboutQuery);
useRevealObserver(page);

const heroSection = computed(() => {
  if (!page.value) return null;
  return {
    _type: 'heroSection',
    title: page.value.heroHeadlineAlludes,
    subtitle: page.value.heroSubheadlineAlludes,
    image: page.value.heroImage,
    imageAlt: page.value.heroImageAlt,
  };
});

const originStory = computed(() => page.value?.originStoryAlludes);
const teamBio = computed(() => page.value?.teamBioAlludes);

const teamBioImage = computed(() => {
  const img = page.value?.teamBioImage;
  if (!img?.asset) return null;
  const x = typeof img.hotspot?.x === 'number' ? img.hotspot.x : 0.5;
  const y = typeof img.hotspot?.y === 'number' ? img.hotspot.y : 0.5;
  return {
    src: sanityImage(img).width(720).auto('format').url(),
    alt: page.value?.teamBioImageAlt || '',
    position: `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`,
  };
});

const hasSplit = computed(
  () =>
    !!(page.value?.approachHeading || page.value?.approachBody) ||
    !!(page.value?.whoWeServeHeading || page.value?.whoWeServeBody)
);
</script>

<template>
  <main class="page page--about">
    <!-- 1. Hero -->
    <HeroSection v-if="heroSection" :section="heroSection" />

    <!-- 2. Our Story -->
    <section v-if="originStory" class="reveal py-16 px-6 bg-(--color-bg)">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold text-(--color-text) mb-6">Our Story</h2>
        <p class="text-(--color-text-secondary) whitespace-pre-line leading-relaxed">{{ originStory }}</p>
      </div>
    </section>

    <!-- 3. Split / Two Column -->
    <section v-if="hasSplit" class="reveal py-16 px-6 about-split">
      <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        <div v-if="page?.approachHeading || page?.approachBody">
          <h2 v-if="page?.approachHeading" class="text-2xl font-bold text-(--color-text) mb-4">{{ page.approachHeading }}</h2>
          <p v-if="page?.approachBody" class="text-(--color-text-secondary) whitespace-pre-line leading-relaxed">{{ page.approachBody }}</p>
        </div>
        <div v-if="page?.whoWeServeHeading || page?.whoWeServeBody">
          <h2 v-if="page?.whoWeServeHeading" class="text-2xl font-bold text-(--color-text) mb-4">{{ page.whoWeServeHeading }}</h2>
          <p v-if="page?.whoWeServeBody" class="text-(--color-text-secondary) whitespace-pre-line leading-relaxed">{{ page.whoWeServeBody }}</p>
        </div>
      </div>
    </section>

    <!-- 4. About Elyse -->
    <section v-if="teamBio" class="reveal py-16 px-6 bg-(--color-bg-secondary)">
      <div
        class="mx-auto"
        :class="teamBioImage ? 'max-w-5xl grid grid-cols-1 md:grid-cols-5 gap-10 items-start' : 'max-w-3xl'"
      >
        <figure v-if="teamBioImage" class="team-bio__figure md:col-span-2">
          <img
            :src="teamBioImage.src"
            :alt="teamBioImage.alt"
            :style="{ objectPosition: teamBioImage.position }"
            class="team-bio__img"
            loading="lazy"
          />
        </figure>
        <div :class="teamBioImage ? 'md:col-span-3' : ''">
          <h2 class="text-3xl font-bold text-(--color-text) mb-6">About Elyse</h2>
          <p class="text-(--color-text-secondary) whitespace-pre-line leading-relaxed">{{ teamBio }}</p>
        </div>
      </div>
    </section>

    <!-- 5. Closing CTA -->
    <section v-if="page?.ctaHeading || page?.ctaButtonLabel" class="reveal-scale py-20 px-6 text-center about-cta">
      <div class="max-w-2xl mx-auto">
        <h2 v-if="page?.ctaHeading" class="text-3xl md:text-4xl font-bold mb-4 about-cta__heading">{{ page.ctaHeading }}</h2>
        <p v-if="page?.ctaSubline" class="text-lg mb-8 about-cta__subline">{{ page.ctaSubline }}</p>
        <SmartLink
          v-if="page?.ctaButtonLabel && page?.ctaButtonUrl"
          :to="page.ctaButtonUrl"
          class="focus-ring-light inline-block font-semibold px-8 py-3 rounded-lg transition-colors about-cta__button"
        >
          {{ page.ctaButtonLabel }}
        </SmartLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-split {
  background-color: var(--color-surface);
}

.about-cta {
  background-color: var(--color-primary);
}

.about-cta__heading,
.about-cta__subline {
  color: var(--color-text-inverse);
}

.about-cta__subline {
  opacity: 0.9;
}

.about-cta__button {
  background-color: var(--color-text-inverse);
  color: var(--color-primary);
}

.about-cta__button:hover {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}

/* ─── Team bio portrait ─────────────────────────────────────────────── */
.team-bio__figure {
  margin: 0;
}

.team-bio__img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: var(--border-radius);
  background-color: var(--color-bg-tertiary);
}
</style>
