<script setup>
import { PortableText } from '@portabletext/vue';
defineProps({ section: { type: Object, default: null } });
</script>

<template>
  <section v-if="section?.heading || section?.body" class="pt-12 px-6 bg-(--color-bg)">
    <div class="max-w-3xl mx-auto">
      <h2 v-if="section?.heading" class="text-3xl font-bold text-(--color-text) mb-6">{{ section.heading }}</h2>
      <div v-if="section?.body" class="legal-content text-(--color-text-secondary)">
        <PortableText :value="section.body" />
      </div>
    </div>
  </section>
</template>
