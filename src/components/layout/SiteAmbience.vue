<template>
  <!-- Hero ambience layer — sits behind hero content -->
  <div
    v-if="variant === 'hero'"
    class="ambience-hero"
    aria-hidden="true"
  >
    <img
      src="/swallows.webp"
      alt=""
      aria-hidden="true"
      class="ambience-swallows"
      loading="lazy"
      decoding="async"
    />
  </div>

  <!-- CTA ambience layer — corner accents on CTA blocks -->
  <div
    v-else-if="variant === 'cta'"
    class="ambience-cta"
    aria-hidden="true"
  >
    <svg class="ambience-shape" width="100%" height="100%" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
      <g transform="rotate(-31.9 1240 100)">
        <line x1="1200" y1="-10" x2="1100" y2="210" stroke="white" stroke-width="1" opacity="0.062" />
        <line x1="1228" y1="-10" x2="1128" y2="210" stroke="white" stroke-width="1" opacity="0.062" />
        <line x1="1256" y1="-10" x2="1156" y2="210" stroke="white" stroke-width="1" opacity="0.062" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{ variant: 'hero' | 'cta' }>()
</script>

<style scoped>
@keyframes ambienceFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
.ambience-shape {
  animation: ambienceFloat 16s ease-in-out infinite;
  will-change: transform;
}
.ambience-shape:nth-child(2) {
  animation-delay: -6s;
}

@keyframes swallowsDrift {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-10px); }
}
.ambience-swallows {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  width: clamp(180px, 28vw, 360px);
  height: auto;
  /* Source asset is baked-in navy on transparent — convert to soft white */
  filter: brightness(0) invert(1) opacity(0.22);
  pointer-events: none;
  animation: swallowsDrift 14s ease-in-out infinite;
  will-change: transform;
}

@media (max-width: 640px) {
  .ambience-swallows {
    top: 1rem;
    right: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambience-shape,
  .ambience-swallows {
    animation: none;
  }
}

.ambience-hero {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ambience-cta {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
