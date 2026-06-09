<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ section: { type: Object, default: null } });
const faqs = computed(() => props.section?.items || []);
const openFaq = ref(null);
function toggleFaq(idx) { openFaq.value = openFaq.value === idx ? null : idx; }
</script>

<template>
  <section v-if="faqs.length" class="reveal py-16 px-6 bg-(--color-bg)">
    <div class="max-w-3xl mx-auto">
      <div v-if="section?.heading || section?.subheading" class="text-center mb-10">
        <h2 v-if="section?.heading" class="text-3xl font-bold text-(--color-text) mb-3">{{ section.heading }}</h2>
        <p v-if="section?.subheading" class="text-(--color-text-secondary) text-base">{{ section.subheading }}</p>
      </div>
      <div class="divide-y divide-(--color-border) border-y border-(--color-border)">
        <div v-for="(item, idx) in faqs" :key="idx">
          <button :aria-expanded="openFaq === idx" :aria-controls="`faq-panel-${idx}`" class="w-full flex items-center justify-between py-5 text-left gap-4 rounded-lg hover:bg-(--color-surface) px-2 -mx-2 focus-ring transition-colors" @click="toggleFaq(idx)">
            <span class="font-medium text-(--color-text) text-sm md:text-base">{{ item.question }}</span>
            <span aria-hidden="true" class="shrink-0 w-8 h-8 rounded-full bg-(--color-surface) flex items-center justify-center text-lg font-medium text-(--color-text-secondary) transition-transform duration-200" :class="openFaq === idx ? 'rotate-45' : ''">+</span>
          </button>
          <div v-if="openFaq === idx" :id="`faq-panel-${idx}`" role="region" :aria-label="item.question" class="pb-5 text-(--color-text-secondary) text-sm leading-relaxed px-2 -mx-2">{{ item.answer }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
