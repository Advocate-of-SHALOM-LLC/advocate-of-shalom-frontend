<script setup>
import { computed } from 'vue';
import { useHead } from '@unhead/vue';
import { useSanity } from '@/composables/useSanity';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';
import { sanityImage } from '@/composables/useSanityImage';

const { data: page } = useSanity(pageQuery('/'));
useRevealObserver(page);

// LCP tuning: the hero uses a CSS background-image whose URL is only known
// after Sanity data arrives. Browsers can't preload CSS backgrounds and
// don't know the URL exists until CSS parses — so we mount a runtime
// <link rel="preload"> the moment the page data resolves. Starts the fetch
// a beat earlier than the CSS parser would.
const heroPreloadHref = computed(() => {
  const hero = page.value?.sections?.find?.((s) => s?._type === 'heroSection');
  if (!hero?.image) return null;
  return sanityImage(hero.image).width(1920).auto('format').url();
});

useHead({
  link: computed(() =>
    heroPreloadHref.value
      ? [
          {
            rel: 'preload',
            as: 'image',
            href: heroPreloadHref.value,
            fetchpriority: 'high',
          },
        ]
      : []
  ),
});
</script>

<template>
  <main class="page page--home">
    <template v-for="section in (page?.sections || [])" :key="section._key">
      <component :is="sectionMap[section._type]" v-if="sectionMap[section._type]" :section="section" />
    </template>
  </main>
</template>
