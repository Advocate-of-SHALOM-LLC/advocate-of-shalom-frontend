<script setup>
import { ref, computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
import SmartLink from '@/components/ui/SmartLink.vue';
import SiteAmbience from '@/components/layout/SiteAmbience.vue';
import { sanityImage } from '@/composables/useSanityImage';

const props = defineProps({ section: { type: Object, default: null } });
const site = useSiteStore();
const heroRef = ref(null);

const heroStyle = computed(() => {
  const img = props.section?.image;
  if (!img) return {};
  const url = sanityImage(img).width(1920).auto('format').url();
  // Translate Sanity hotspot (x, y are 0–1 fractions) into CSS background-position.
  // Default to center if no hotspot has been set in Studio.
  const x = typeof img.hotspot?.x === 'number' ? img.hotspot.x : 0.5;
  const y = typeof img.hotspot?.y === 'number' ? img.hotspot.y : 0.5;
  return {
    '--hero-image': `url(${url})`,
    '--hero-image-position': `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`,
  };
});
</script>

<template>
  <section ref="heroRef" class="hero relative flex items-center justify-center min-h-[480px] px-6 py-24 overflow-hidden" :style="heroStyle" :aria-label="section?.imageAlt || undefined">
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
  background-size: cover;
  background-position: var(--hero-image-position, center);
}
.hero[style*="--hero-image"] {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 75%, transparent) 0%, color-mix(in srgb, var(--color-secondary) 75%, transparent) 100%), var(--hero-image);
  background-size: cover;
  background-position: var(--hero-image-position, center);
}
</style>
