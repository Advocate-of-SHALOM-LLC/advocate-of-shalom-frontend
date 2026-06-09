<script setup>
import { computed } from 'vue';
import { getLucideIcon } from '@/composables/useLucideIcons';

const props = defineProps({ section: { type: Object, default: null } });
const features = computed(() => props.section?.items || []);

const columnClass = computed(() => {
  const n = features.value.length;
  if (n === 2 || n === 4) return 'md:grid-cols-2';
  return 'md:grid-cols-3';
});
</script>

<template>
  <section class="reveal py-16 px-6 bg-(--color-bg)">
    <div v-if="section?.heading" class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-(--color-text) text-center mb-12">{{ section.heading }}</h2>
    </div>
    <div v-if="features.length" class="reveal-stagger max-w-5xl mx-auto grid grid-cols-1 gap-8" :class="columnClass">
      <div v-for="(feature, i) in features" :key="feature._key || i" class="text-center p-6 flex flex-col items-center">
        <component
          :is="getLucideIcon(feature.icon)"
          class="w-8 h-8 mb-4 text-(--color-primary)"
          :stroke-width="1.5"
          aria-hidden="true"
        />
        <h3 class="text-lg font-semibold text-(--color-text) mb-2">{{ feature.title }}</h3>
        <p class="text-(--color-text-secondary) text-sm">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>
