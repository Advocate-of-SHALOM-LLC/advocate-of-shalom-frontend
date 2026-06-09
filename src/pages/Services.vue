<script setup>
import { computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useRevealObserver } from '@/composables/useRevealObserver';
import HeroSection from '@/components/sections/HeroSection.vue';
import SmartLink from '@/components/ui/SmartLink.vue';
import { getLucideIcon } from '@/composables/useLucideIcons';

const servicesQuery = `*[_type == "servicesPage"][0]{
  heroTitle, heroSubtitle, heroCta, heroImage, heroImageAlt,
  servicesIntroHeading, servicesIntroBody,
  servicesHeading, servicesSubheading,
  services[]{ _key, title, description, icon },
  processHeading, processSubheading,
  steps[]{ _key, title, description, icon },
  faqHeading, faqSubheading,
  faqs[]{ _key, question, answer },
  servicesCtaHeadline, servicesCtaText, servicesCtaButtonLabel, servicesCtaButtonUrl
}`;

const { data: page } = useSanity(servicesQuery);
useRevealObserver(page);

const heroSection = computed(() => {
  if (!page.value) return null;
  return {
    _type: 'heroSection',
    title: page.value.heroTitle,
    subtitle: page.value.heroSubtitle,
    cta:
      page.value.heroCta?.label && page.value.heroCta?.url
        ? { label: page.value.heroCta.label, url: page.value.heroCta.url }
        : null,
    image: page.value.heroImage,
    imageAlt: page.value.heroImageAlt,
  };
});

const services = computed(() => page.value?.services || []);
const steps = computed(() => page.value?.steps || []);
const faqs = computed(() => page.value?.faqs || []);
</script>

<template>
  <main class="page page--services">
    <!-- 1. BlockHero -->
    <HeroSection v-if="heroSection" :section="heroSection" />

    <!-- 2. BlockText -->
    <section
      v-if="page?.servicesIntroHeading || page?.servicesIntroBody"
      class="reveal py-16 px-6 services-text"
    >
      <div class="max-w-3xl mx-auto text-center">
        <h2 v-if="page?.servicesIntroHeading" class="text-3xl font-bold mb-6 text-(--color-text)">
          {{ page.servicesIntroHeading }}
        </h2>
        <p
          v-if="page?.servicesIntroBody"
          class="text-lg text-(--color-text-secondary) whitespace-pre-line leading-relaxed"
        >
          {{ page.servicesIntroBody }}
        </p>
      </div>
    </section>

    <!-- 3. BlockServices -->
    <section v-if="services.length || page?.servicesHeading" class="reveal py-16 px-6 services-list">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 v-if="page?.servicesHeading" class="text-3xl font-bold text-(--color-text) mb-3">
            {{ page.servicesHeading }}
          </h2>
          <p v-if="page?.servicesSubheading" class="text-lg text-(--color-text-secondary)">
            {{ page.servicesSubheading }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          <article
            v-for="svc in services"
            :key="svc._key"
            class="service-card"
          >
            <component
              :is="getLucideIcon(svc.icon)"
              class="service-card__icon w-8 h-8 text-(--color-primary)"
              :stroke-width="1.5"
              aria-hidden="true"
            />
            <h3 class="service-card__title">{{ svc.title }}</h3>
            <p v-if="svc.description" class="service-card__desc">{{ svc.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. BlockProcess -->
    <section v-if="steps.length || page?.processHeading" class="reveal py-16 px-6 services-process">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 v-if="page?.processHeading" class="text-3xl font-bold text-(--color-text) mb-3">
            {{ page.processHeading }}
          </h2>
          <p v-if="page?.processSubheading" class="text-lg text-(--color-text-secondary)">
            {{ page.processSubheading }}
          </p>
        </div>

        <ol class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger process-list">
          <li
            v-for="(step, i) in steps"
            :key="step._key"
            class="process-step"
          >
            <div class="process-step__number">{{ i + 1 }}</div>
            <component
              :is="getLucideIcon(step.icon)"
              class="process-step__icon w-8 h-8 text-(--color-primary)"
              :stroke-width="1.5"
              aria-hidden="true"
            />
            <h3 class="process-step__title">{{ step.title }}</h3>
            <p v-if="step.description" class="process-step__desc">{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 5. BlockFaq -->
    <section v-if="faqs.length || page?.faqHeading" class="reveal py-16 px-6 services-faq">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-10">
          <h2 v-if="page?.faqHeading" class="text-3xl font-bold text-(--color-text) mb-3">
            {{ page.faqHeading }}
          </h2>
          <p v-if="page?.faqSubheading" class="text-(--color-text-secondary)">
            {{ page.faqSubheading }}
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <details
            v-for="faq in faqs"
            :key="faq._key"
            class="faq-item"
          >
            <summary class="faq-item__question">
              <span>{{ faq.question }}</span>
              <span class="faq-item__indicator" aria-hidden="true">+</span>
            </summary>
            <div class="faq-item__answer">{{ faq.answer }}</div>
          </details>
        </div>
      </div>
    </section>

    <!-- 6. BlockCta -->
    <section
      v-if="page?.servicesCtaHeadline || page?.servicesCtaButtonLabel"
      class="reveal-scale py-20 px-6 text-center services-cta"
    >
      <div class="max-w-2xl mx-auto">
        <h2 v-if="page?.servicesCtaHeadline" class="text-3xl md:text-4xl font-bold mb-4 services-cta__heading">
          {{ page.servicesCtaHeadline }}
        </h2>
        <p v-if="page?.servicesCtaText" class="text-lg mb-8 services-cta__text">
          {{ page.servicesCtaText }}
        </p>
        <SmartLink
          v-if="page?.servicesCtaButtonLabel && page?.servicesCtaButtonUrl"
          :to="page.servicesCtaButtonUrl"
          class="focus-ring-light inline-block font-semibold px-8 py-3 rounded-lg transition-colors services-cta__button"
        >
          {{ page.servicesCtaButtonLabel }}
        </SmartLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ─── Block backgrounds for visual rhythm ───────────────────────────── */
.services-text {
  background-color: var(--color-bg);
}
.services-list {
  background-color: var(--color-bg-secondary);
}
.services-process {
  background-color: var(--color-bg);
}
.services-faq {
  background-color: var(--color-bg-secondary);
}

/* ─── Service cards ─────────────────────────────────────────────────── */
.service-card {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.service-card__icon {
  margin-bottom: 1rem;
}

.service-card__title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.service-card__desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* ─── Process steps ─────────────────────────────────────────────────── */
.process-list {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: process-counter;
}

.process-step {
  position: relative;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.process-step__number {
  position: absolute;
  top: -0.875rem;
  left: 1.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9375rem;
  border-radius: 50%;
}

.process-step__icon {
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.process-step__title {
  font-family: var(--font-heading);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.process-step__desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* ─── FAQ accordion ─────────────────────────────────────────────────── */
.faq-item {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.faq-item:hover {
  border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
}

.faq-item[open] {
  border-color: var(--color-primary);
}

.faq-item__question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.faq-item__question::-webkit-details-marker {
  display: none;
}

.faq-item__question:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: -3px;
}

.faq-item__indicator {
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-primary);
  font-weight: 400;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.faq-item[open] .faq-item__indicator {
  transform: rotate(45deg);
}

.faq-item__answer {
  padding: 0 1.25rem 1.25rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-line;
}

/* ─── Closing CTA ───────────────────────────────────────────────────── */
.services-cta {
  background-color: var(--color-primary);
}

.services-cta__heading,
.services-cta__text {
  color: var(--color-text-inverse);
}

.services-cta__text {
  opacity: 0.9;
}

.services-cta__button {
  background-color: var(--color-text-inverse);
  color: var(--color-primary);
}

.services-cta__button:hover {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}
</style>
