<script setup>
import { computed } from 'vue';
import { sanityImage } from '@/composables/useSanityImage';

const props = defineProps({ section: { type: Object, default: null } });

// ── Parse a YouTube or Vimeo URL into an embeddable iframe src.
//    Returns null if the URL isn't recognized (placeholder renders instead).
function toEmbedUrl(raw) {
  if (typeof raw !== 'string') return null;
  const url = raw.trim();
  if (!url) return null;

  // YouTube: youtu.be/ID  |  youtube.com/watch?v=ID  |  youtube.com/embed/ID  |  youtube.com/shorts/ID
  const ytShort = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const ytWatch = url.match(/^https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)([\w-]{6,})/i);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  // Vimeo: vimeo.com/ID  |  player.vimeo.com/video/ID
  const vimeo = url.match(/^https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

const embedUrl = computed(() => toEmbedUrl(props.section?.videoUrl));

const placeholderImage = computed(() => {
  const img = props.section?.placeholderImage;
  if (!img?.asset) return null;
  const x = typeof img.hotspot?.x === 'number' ? img.hotspot.x : 0.5;
  const y = typeof img.hotspot?.y === 'number' ? img.hotspot.y : 0.5;
  return {
    src: sanityImage(img).width(1280).auto('format').url(),
    position: `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`,
  };
});

const placeholderLabel = computed(
  () => props.section?.placeholderText || 'Video coming soon'
);
</script>

<template>
  <section class="reveal py-16 px-6 video-section">
    <div class="max-w-4xl mx-auto">
      <div v-if="section?.heading || section?.subheading" class="text-center mb-8">
        <h2 v-if="section?.heading" class="text-3xl font-bold mb-3 text-(--color-text)">
          {{ section.heading }}
        </h2>
        <p v-if="section?.subheading" class="text-lg text-(--color-text-secondary)">
          {{ section.subheading }}
        </p>
      </div>

      <!-- Embedded video -->
      <div v-if="embedUrl" class="video-section__frame">
        <iframe
          :src="embedUrl"
          class="video-section__iframe"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          :title="section?.heading || 'Embedded video'"
        />
      </div>

      <!-- Placeholder card -->
      <div v-else class="video-section__placeholder">
        <div
          v-if="placeholderImage"
          class="video-section__placeholder-bg"
          :style="{
            backgroundImage: `url(${placeholderImage.src})`,
            backgroundPosition: placeholderImage.position,
          }"
          aria-hidden="true"
        />
        <div class="video-section__placeholder-content">
          <svg
            class="video-section__play-icon"
            viewBox="0 0 80 80"
            width="64"
            height="64"
            aria-hidden="true"
          >
            <circle cx="40" cy="40" r="38" fill="currentColor" opacity="0.12" />
            <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M33 28 L33 52 L54 40 Z" fill="currentColor" />
          </svg>
          <p class="video-section__placeholder-label">{{ placeholderLabel }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.video-section {
  background-color: var(--color-bg);
}

/* Aspect-ratio container for both iframe and placeholder */
.video-section__frame,
.video-section__placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--color-surface);
}

.video-section__frame {
  border: 1px solid var(--color-border);
}

.video-section__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Placeholder */
.video-section__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--color-border);
}

.video-section__placeholder-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  opacity: 0.5;
  filter: grayscale(0.4) blur(1px);
}

.video-section__placeholder-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-muted);
}

.video-section__play-icon {
  color: var(--color-primary);
}

.video-section__placeholder-label {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}
</style>
