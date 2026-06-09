<script setup>
import { computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useRevealObserver } from '@/composables/useRevealObserver';
import HeroSection from '@/components/sections/HeroSection.vue';
import SmartLink from '@/components/ui/SmartLink.vue';
import { getLucideIcon } from '@/composables/useLucideIcons';

const partnersQuery = `*[_type == "partnersPage"][0]{
  heroTitle, heroSubtitle, heroCta, heroImage, heroImageAlt,
  partnersIntroHeading, partnersIntroBody,
  partnersServicesHeading, partnersServicesSubheading,
  partnerServices[]{ _key, title, description, icon },
  whoWeWorkWithHeading, whoWeWorkWithBody, whoWeWorkWithFeatures,
  whatWeNeedHeading, whatWeNeedBody, whatWeNeedFeatures,
  partnersTestimonialsHeading,
  partnerTestimonials[]{ _key, quote, authorName, authorRole, authorCompany },
  partnersCtaHeadline, partnersCtaText, partnersCtaButtonLabel, partnersCtaButtonUrl
}`;

const { data: page } = useSanity(partnersQuery);
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

const services = computed(() => page.value?.partnerServices || []);
const testimonials = computed(() => page.value?.partnerTestimonials || []);
const hasTestimonials = computed(() => testimonials.value.length >= 1);
</script>

<template>
  <main class="page page--partners">
    <!-- 1. BlockHero -->
    <HeroSection v-if="heroSection" :section="heroSection" />

    <!-- 2. BlockText -->
    <section
      v-if="page?.partnersIntroHeading || page?.partnersIntroBody"
      class="reveal py-16 px-6 partners-text"
    >
      <div class="max-w-3xl mx-auto text-center">
        <h2 v-if="page?.partnersIntroHeading" class="text-3xl font-bold mb-6 text-(--color-text)">
          {{ page.partnersIntroHeading }}
        </h2>
        <p
          v-if="page?.partnersIntroBody"
          class="text-lg text-(--color-text-secondary) whitespace-pre-line leading-relaxed"
        >
          {{ page.partnersIntroBody }}
        </p>
      </div>
    </section>

    <!-- 3. BlockServices -->
    <section v-if="services.length || page?.partnersServicesHeading" class="reveal py-16 px-6 partners-services">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 v-if="page?.partnersServicesHeading" class="text-3xl font-bold text-(--color-text) mb-3">
            {{ page.partnersServicesHeading }}
          </h2>
          <p v-if="page?.partnersServicesSubheading" class="text-lg text-(--color-text-secondary)">
            {{ page.partnersServicesSubheading }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          <article
            v-for="svc in services"
            :key="svc._key"
            class="partner-service-card"
          >
            <component
              :is="getLucideIcon(svc.icon)"
              class="partner-service-card__icon w-8 h-8 text-(--color-primary)"
              :stroke-width="1.5"
              aria-hidden="true"
            />
            <h3 class="partner-service-card__title">{{ svc.title }}</h3>
            <p v-if="svc.description" class="partner-service-card__desc">{{ svc.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. BlockSplit — two text columns -->
    <section
      v-if="page?.whoWeWorkWithHeading || page?.whatWeNeedHeading"
      class="reveal py-16 px-6 partners-split"
    >
      <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        <div v-if="page?.whoWeWorkWithHeading || page?.whoWeWorkWithBody || page?.whoWeWorkWithFeatures?.length">
          <h2 v-if="page?.whoWeWorkWithHeading" class="text-2xl font-bold mb-4 text-(--color-text)">
            {{ page.whoWeWorkWithHeading }}
          </h2>
          <p v-if="page?.whoWeWorkWithBody" class="text-(--color-text-secondary) mb-5 leading-relaxed">
            {{ page.whoWeWorkWithBody }}
          </p>
          <ul v-if="page?.whoWeWorkWithFeatures?.length" class="partners-split__list">
            <li v-for="(item, i) in page.whoWeWorkWithFeatures" :key="i">{{ item }}</li>
          </ul>
        </div>

        <div v-if="page?.whatWeNeedHeading || page?.whatWeNeedBody || page?.whatWeNeedFeatures?.length">
          <h2 v-if="page?.whatWeNeedHeading" class="text-2xl font-bold mb-4 text-(--color-text)">
            {{ page.whatWeNeedHeading }}
          </h2>
          <p v-if="page?.whatWeNeedBody" class="text-(--color-text-secondary) mb-5 leading-relaxed">
            {{ page.whatWeNeedBody }}
          </p>
          <ul v-if="page?.whatWeNeedFeatures?.length" class="partners-split__list">
            <li v-for="(item, i) in page.whatWeNeedFeatures" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 5. BlockTestimonials — conditional, hidden when array is empty -->
    <section v-if="hasTestimonials" class="reveal py-16 px-6 partners-testimonials">
      <div class="max-w-6xl mx-auto">
        <h2
          v-if="page?.partnersTestimonialsHeading"
          class="text-3xl font-bold mb-12 text-center text-(--color-text)"
        >
          {{ page.partnersTestimonialsHeading }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 reveal-stagger">
          <figure
            v-for="t in testimonials"
            :key="t._key"
            class="partner-testimonial"
          >
            <blockquote class="partner-testimonial__quote">"{{ t.quote }}"</blockquote>
            <figcaption class="partner-testimonial__attrib">
              <span class="partner-testimonial__name">{{ t.authorName }}</span>
              <span v-if="t.authorRole || t.authorCompany" class="partner-testimonial__role">
                {{ [t.authorRole, t.authorCompany].filter(Boolean).join(', ') }}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- 6. BlockCta -->
    <section
      v-if="page?.partnersCtaHeadline || page?.partnersCtaButtonLabel"
      class="reveal-scale py-20 px-6 text-center partners-cta"
    >
      <div class="max-w-2xl mx-auto">
        <h2 v-if="page?.partnersCtaHeadline" class="text-3xl md:text-4xl font-bold mb-4 partners-cta__heading">
          {{ page.partnersCtaHeadline }}
        </h2>
        <p v-if="page?.partnersCtaText" class="text-lg mb-8 partners-cta__text">
          {{ page.partnersCtaText }}
        </p>
        <SmartLink
          v-if="page?.partnersCtaButtonLabel && page?.partnersCtaButtonUrl"
          :to="page.partnersCtaButtonUrl"
          class="focus-ring-light inline-block font-semibold px-8 py-3 rounded-lg transition-colors partners-cta__button"
        >
          {{ page.partnersCtaButtonLabel }}
        </SmartLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ─── Block backgrounds for visual rhythm ───────────────────────────── */
.partners-text {
  background-color: var(--color-bg);
}
.partners-services {
  background-color: var(--color-bg-secondary);
}
.partners-split {
  background-color: var(--color-bg);
}
.partners-testimonials {
  background-color: var(--color-bg-secondary);
}

/* ─── Services cards ────────────────────────────────────────────────── */
.partner-service-card {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.partner-service-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.partner-service-card__icon {
  margin-bottom: 1rem;
}

.partner-service-card__title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.partner-service-card__desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* ─── Split bullet lists ────────────────────────────────────────────── */
.partners-split__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.partners-split__list li {
  position: relative;
  padding-left: 1.5rem;
  font-size: 1rem;
  color: var(--color-text);
  line-height: 1.5;
}

.partners-split__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--color-primary);
}

/* ─── Testimonials ──────────────────────────────────────────────────── */
.partner-testimonial {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0;
}

.partner-testimonial__quote {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
  font-style: italic;
}

.partner-testimonial__attrib {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.partner-testimonial__name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9375rem;
}

.partner-testimonial__role {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* ─── Closing CTA ───────────────────────────────────────────────────── */
.partners-cta {
  background-color: var(--color-primary);
}

.partners-cta__heading,
.partners-cta__text {
  color: var(--color-text-inverse);
}

.partners-cta__text {
  opacity: 0.9;
}

.partners-cta__button {
  background-color: var(--color-text-inverse);
  color: var(--color-primary);
}

.partners-cta__button:hover {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}
</style>
