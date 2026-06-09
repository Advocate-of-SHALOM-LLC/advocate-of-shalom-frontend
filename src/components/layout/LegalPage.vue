<script setup>
import { ref, onMounted, computed } from 'vue';
import { PortableText } from '@portabletext/vue';

const props = defineProps({
  slug: { type: String, required: true },
  fallbackTitle: { type: String, default: '' },
});

const page = ref(null);
const loading = ref(true);
const notFound = ref(false);

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

onMounted(async () => {
  if (!projectId) {
    loading.value = false;
    notFound.value = true;
    return;
  }
  try {
    // Use api.sanity.io (not apicdn) so edits in Studio appear promptly after publishing
    const query = encodeURIComponent(
      `*[_type == "legalPage" && slug.current == "${props.slug}"][0]{ title, lastUpdated, body }`
    );
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
      { cache: 'no-store' }
    );
    const json = await res.json();
    if (json.result) {
      page.value = json.result;
    } else {
      notFound.value = true;
    }
  } catch (e) {
    console.error('Failed to fetch legal page:', e);
    notFound.value = true;
  } finally {
    loading.value = false;
  }
});

const formattedDate = computed(() => {
  if (!page.value?.lastUpdated) return '';
  // Sanity stores lastUpdated as a calendar date (e.g. "2026-05-25"), which
  // parses as midnight UTC. Without timeZone: 'UTC', the formatter shifts it
  // into the viewer's local zone — viewers in MST (UTC-7) would see the
  // previous day. Force UTC so the date always renders as the stored value.
  return new Date(page.value.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
});
</script>

<template>
  <main class="legal-page">
    <article class="legal-page__article">
      <!-- Loading skeleton -->
      <div v-if="loading" class="legal-skeleton" aria-busy="true" aria-label="Loading content">
        <div class="legal-skeleton__title"></div>
        <div class="legal-skeleton__meta"></div>
        <div class="legal-skeleton__block"></div>
        <div class="legal-skeleton__line"></div>
        <div class="legal-skeleton__line"></div>
        <div class="legal-skeleton__line legal-skeleton__line--short"></div>
        <div class="legal-skeleton__block legal-skeleton__block--small"></div>
        <div class="legal-skeleton__line"></div>
        <div class="legal-skeleton__line"></div>
      </div>

      <!-- Loaded content -->
      <template v-else-if="page">
        <h1 class="legal-page__title">{{ page.title }}</h1>
        <p v-if="formattedDate" class="legal-page__date">Last updated {{ formattedDate }}</p>
        <div v-if="page.body" class="legal-content">
          <PortableText :value="page.body" />
        </div>
      </template>

      <!-- Empty state — intentional, not broken -->
      <template v-else-if="notFound">
        <h1 class="legal-page__title">{{ fallbackTitle }}</h1>
        <div class="legal-content legal-page__empty">
          <p>Content coming soon.</p>
        </div>
      </template>
    </article>
  </main>
</template>

<style scoped>
.legal-page {
  background-color: var(--color-bg);
  padding: 4rem 1.5rem 5rem;
}

.legal-page__article {
  max-width: 48rem; /* max-w-3xl — comfortable reading width */
  margin: 0 auto;
}

.legal-page__title {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .legal-page__title {
    font-size: 2.75rem;
  }
}

.legal-page__date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0 0 2.5rem;
}

.legal-page__empty {
  color: var(--color-text-muted);
}

/* ─── Skeleton loader ────────────────────────────────────────────────── */
@keyframes legalSkeletonPulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.95; }
}

.legal-skeleton > * {
  background-color: var(--color-bg-secondary);
  border-radius: 4px;
  animation: legalSkeletonPulse 1.4s ease-in-out infinite;
}

.legal-skeleton__title {
  height: 2.5rem;
  width: 60%;
  margin-bottom: 0.75rem;
}

.legal-skeleton__meta {
  height: 0.875rem;
  width: 12rem;
  margin-bottom: 2.5rem;
}

.legal-skeleton__block {
  height: 1.5rem;
  width: 40%;
  margin: 1.5rem 0 1rem;
}

.legal-skeleton__block--small {
  margin-top: 2rem;
}

.legal-skeleton__line {
  height: 0.875rem;
  width: 100%;
  margin-bottom: 0.625rem;
}

.legal-skeleton__line--short {
  width: 80%;
}

@media (prefers-reduced-motion: reduce) {
  .legal-skeleton > * {
    animation: none;
    opacity: 0.6;
  }
}
</style>
