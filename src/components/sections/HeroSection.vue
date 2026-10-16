<script setup>
import { ref, computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
import SmartLink from '@/components/ui/SmartLink.vue';
import SiteAmbience from '@/components/layout/SiteAmbience.vue';
import { sanityImage } from '@/composables/useSanityImage';

const props = defineProps({ section: { type: Object, default: null } });
const site = useSiteStore();
const heroRef = ref(null);

// The hero image is the page's largest element, so it decides how soon the
// page looks loaded. A real <img> with a srcset lets a phone download a
// 640–960px version instead of the 1920px one a CSS background forced on
// every screen, and fetchpriority puts it ahead of everything else.
const HERO_WIDTHS = [640, 960, 1280, 1600, 1920];

const heroImage = computed(() => {
  const img = props.section?.image;
  if (!img) return null;
  // fit('max') never scales the upload up past its own size.
  const at = (w) => sanityImage(img).width(w).fit('max').quality(75).auto('format').url();
  // Translate Sanity hotspot (x, y are 0–1 fractions) into object-position.
  // Default to center if no hotspot has been set in Studio.
  const x = typeof img.hotspot?.x === 'number' ? img.hotspot.x : 0.5;
  const y = typeof img.hotspot?.y === 'number' ? img.hotspot.y : 0.5;
  return {
    src: at(1280),
    srcset: HERO_WIDTHS.map((w) => `${at(w)} ${w}w`).join(', '),
    position: `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`,
  };
});
</script>

<template>
  <section ref="heroRef" class="hero relative flex items-center justify-center min-h-[480px] px-6 py-24 overflow-hidden" :class="{ 'hero--image': heroImage }" :aria-label="section?.imageAlt || undefined">
    <img
      v-if="heroImage"
      class="hero__image"
      :src="heroImage.src"
      :srcset="heroImage.srcset"
      sizes="100vw"
      :style="{ objectPosition: heroImage.position }"
      alt=""
      fetchpriority="high"
      decoding="async"
    />
    <div v-if="heroImage" class="hero__tint" aria-hidden="true"></div>
    <SiteAmbience variant="hero" />
    <div class="relative z-10 text-center text-white max-w-3xl mx-auto">
      <h1 v-if="section?.title || site.name" class="text-5xl font-extrabold leading-tight mb-4">{{ section?.title || site.name }}</h1>
      <p v-if="section?.subtitle || site.tagline" class="text-xl opacity-80 mb-8">{{ section?.subtitle || site.tagline }}</p>
      <SmartLink v-if="section?.cta?.label && section?.cta?.url" :to="section.cta.url" class="focus-ring-light inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-(--color-primary) transition-colors">{{ section.cta.label }}</SmartLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}
/* Decorative, so alt="" — the section's aria-label carries the description. */
.hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* The same brand tint the background version laid over the photo. */
.hero__tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 75%, transparent) 0%, color-mix(in srgb, var(--color-secondary) 75%, transparent) 100%);
}
</style>
