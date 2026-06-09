<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  /** 'full' | 'alludes' — the currently effective version */
  current: { type: String, required: true },
  /** Optional label override for the Full button */
  labelFull: { type: String, default: 'Full Story' },
  /** Optional label override for the Alludes button */
  labelAlludes: { type: String, default: 'Professional' },
});

const emit = defineEmits(['change']);

const dismissed = ref(false);

function pick(value) {
  if (value === props.current) return;
  emit('change', value);
}
</script>

<template>
  <div
    v-if="!dismissed"
    class="ab-toggle"
    role="region"
    aria-label="Preview: story version toggle"
  >
    <div class="ab-toggle__head">
      <span class="ab-toggle__badge">PREVIEW</span>
      <span class="ab-toggle__label">Story version</span>
      <button
        type="button"
        class="ab-toggle__dismiss"
        aria-label="Hide preview toggle"
        @click="dismissed = true"
      >
        <X :size="14" />
      </button>
    </div>
    <div class="ab-toggle__buttons" role="group" aria-label="Choose story version">
      <button
        type="button"
        class="ab-toggle__btn"
        :class="{ 'ab-toggle__btn--active': current === 'full' }"
        :aria-pressed="current === 'full'"
        @click="pick('full')"
      >
        <span class="ab-toggle__btn-key">A</span>
        <span>{{ labelFull }}</span>
      </button>
      <button
        type="button"
        class="ab-toggle__btn"
        :class="{ 'ab-toggle__btn--active': current === 'alludes' }"
        :aria-pressed="current === 'alludes'"
        @click="pick('alludes')"
      >
        <span class="ab-toggle__btn-key">B</span>
        <span>{{ labelAlludes }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ab-toggle {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.875rem;
  background-color: rgba(13, 27, 48, 0.96);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  max-width: calc(100vw - 2.5rem);
}

.ab-toggle__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ab-toggle__badge {
  font-family: var(--font-heading);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  background-color: color-mix(in srgb, var(--color-accent) 18%, transparent);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.ab-toggle__label {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
}

.ab-toggle__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.ab-toggle__dismiss:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
}

.ab-toggle__dismiss:focus-visible {
  outline: 2px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.ab-toggle__buttons {
  display: flex;
  gap: 0.375rem;
  padding: 0.25rem;
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: 0.5rem;
}

.ab-toggle__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.ab-toggle__btn:hover:not(.ab-toggle__btn--active) {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.ab-toggle__btn--active {
  background-color: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.ab-toggle__btn:focus-visible {
  outline: 2px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.ab-toggle__btn-key {
  font-family: var(--font-heading);
  font-size: 0.6875rem;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
}

.ab-toggle__btn--active .ab-toggle__btn-key {
  background-color: rgba(255, 255, 255, 0.22);
}

@media (max-width: 480px) {
  .ab-toggle {
    bottom: 0.75rem;
    right: 0.75rem;
    left: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
