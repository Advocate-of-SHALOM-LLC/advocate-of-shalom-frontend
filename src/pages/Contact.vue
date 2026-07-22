<script setup>
import { ref, reactive, computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useRevealObserver } from '@/composables/useRevealObserver';
import { useSiteStore } from '@/stores/useSiteStore';
import { getSocialIcon } from '@/composables/useSocialIcons';

const contactQuery = `*[_type == "contactPage"][0]{
  textHeading, bodyContent,
  contactHeading, contactSubheading, contactAddress, contactPhone, contactEmail,
  contactHoursLabel, contactWarmNote, contactResponseNote,
  mapHeading, mapAddress, mapPhone, mapEmail, mapAppointmentNote, mapEmbedUrl
}`;

const { data: page } = useSanity(contactQuery);
useRevealObserver(page);

// Social links — same pattern as SiteFooter
const site = useSiteStore();
const { data: socialDoc } = useSanity(`*[_type == "socialLinks"][0]{"links": coalesce(links, items)}`);
const socialLinks = computed(() => {
  const raw = socialDoc.value?.links || site.socialLinks || [];
  return raw
    .filter((l) => l && l.platform && l.url)
    .map((l) => ({ ...l, platform: l.platform.toLowerCase() }));
});
const platformLabels = {
  facebook: 'Facebook', instagram: 'Instagram', twitter: 'X', linkedin: 'LinkedIn',
  youtube: 'YouTube', tiktok: 'TikTok', github: 'GitHub', pinterest: 'Pinterest',
  threads: 'Threads', bluesky: 'Bluesky', mastodon: 'Mastodon', nextdoor: 'Nextdoor',
};

// ── Form state ──
const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
  referralSource: '',
});
const submitting = ref(false);
const status = ref(/** @type {'idle'|'success'|'error'} */ ('idle'));
const errorMessage = ref('');

async function onSubmit() {
  if (submitting.value) return;
  submitting.value = true;
  status.value = 'idle';
  errorMessage.value = '';

  try {
    const res = await fetch('/.netlify/functions/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        referralSource: form.referralSource.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Something went wrong. Please try again.');
    }

    status.value = 'success';
    form.name = '';
    form.email = '';
    form.phone = '';
    form.message = '';
    form.referralSource = '';
  } catch (err) {
    status.value = 'error';
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong.';
  } finally {
    submitting.value = false;
  }
}

// Trim trailing whitespace from the embed URL & require https iframe-friendly URL
const safeEmbedUrl = computed(() => {
  const url = (page.value?.mapEmbedUrl || '').trim();
  return url.startsWith('https://') ? url : '';
});
</script>

<template>
  <main class="page page--contact">
    <!-- BlockText -->
    <section v-if="page?.textHeading || page?.bodyContent" class="reveal py-16 px-6 contact-text">
      <div class="max-w-3xl mx-auto text-center">
        <h1 v-if="page?.textHeading" class="text-4xl md:text-5xl font-bold mb-6 text-(--color-text)">{{ page.textHeading }}</h1>
        <p v-if="page?.bodyContent" class="text-lg text-(--color-text-secondary) whitespace-pre-line leading-relaxed">{{ page.bodyContent }}</p>
      </div>
    </section>

    <!-- BlockContact -->
    <section class="reveal py-16 px-6 contact-form-block">
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
        <!-- Form column -->
        <div class="lg:col-span-3">
          <h2 v-if="page?.contactHeading" class="text-3xl font-bold mb-2 text-(--color-text)">{{ page.contactHeading }}</h2>
          <p v-if="page?.contactSubheading" class="text-(--color-text-secondary) mb-6">{{ page.contactSubheading }}</p>

          <form class="contact-form" novalidate @submit.prevent="onSubmit">
            <div class="contact-form__row">
              <label class="contact-form__field">
                <span class="contact-form__label">Name <span aria-hidden="true" class="contact-form__required">*</span></span>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  autocomplete="name"
                  class="contact-form__input"
                />
              </label>
              <label class="contact-form__field">
                <span class="contact-form__label">Email <span aria-hidden="true" class="contact-form__required">*</span></span>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  class="contact-form__input"
                />
              </label>
            </div>

            <label class="contact-form__field">
              <span class="contact-form__label">Phone <span class="contact-form__optional">(optional)</span></span>
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="contact-form__input"
              />
            </label>

            <label class="contact-form__field">
              <span class="contact-form__label">How can we help your organization or your clients? <span aria-hidden="true" class="contact-form__required">*</span></span>
              <textarea
                v-model="form.message"
                required
                rows="5"
                class="contact-form__input contact-form__textarea"
              ></textarea>
            </label>

            <label class="contact-form__field">
              <span class="contact-form__label">How did you hear about us? <span class="contact-form__optional">(optional)</span></span>
              <input
                v-model="form.referralSource"
                type="text"
                class="contact-form__input"
              />
            </label>

            <div class="contact-form__actions">
              <button
                type="submit"
                class="contact-form__submit focus-ring"
                :disabled="submitting"
              >
                {{ submitting ? 'Sending…' : 'Send Message' }}
              </button>
              <p v-if="page?.contactResponseNote" class="contact-form__note">{{ page.contactResponseNote }}</p>
            </div>

            <div v-if="status === 'success'" role="status" class="contact-form__status contact-form__status--success">
              Thank you — your message is on its way. We'll be in touch soon.
            </div>
            <div v-else-if="status === 'error'" role="alert" class="contact-form__status contact-form__status--error">
              {{ errorMessage || 'Something went wrong sending your message. Please try again.' }}
            </div>
          </form>
        </div>

        <!-- Details column -->
        <aside class="lg:col-span-2 contact-details">
          <div v-if="page?.contactPhone" class="contact-details__item">
            <p class="contact-details__label">Phone</p>
            <a :href="`tel:${page.contactPhone.replace(/[^0-9+]/g, '')}`" class="contact-details__value">{{ page.contactPhone }}</a>
          </div>
          <div v-if="page?.contactEmail" class="contact-details__item">
            <p class="contact-details__label">Email</p>
            <a :href="`mailto:${page.contactEmail}`" class="contact-details__value">{{ page.contactEmail }}</a>
          </div>
          <div v-if="page?.contactAddress" class="contact-details__item">
            <p class="contact-details__label">Address</p>
            <p class="contact-details__value whitespace-pre-line">{{ page.contactAddress }}</p>
          </div>
          <div v-if="page?.contactHoursLabel" class="contact-details__item">
            <p class="contact-details__label">Hours</p>
            <p class="contact-details__value">{{ page.contactHoursLabel }}</p>
          </div>
          <p v-if="page?.contactWarmNote" class="contact-details__warm-note">{{ page.contactWarmNote }}</p>
          <div v-if="socialLinks.length" class="contact-details__social" aria-label="Follow us">
            <a
              v-for="link in socialLinks"
              :key="link.platform"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-details__social-link"
              :aria-label="platformLabels[link.platform] || link.platform"
            >
              <svg v-if="getSocialIcon(link.platform)" viewBox="0 0 24 24" fill="currentColor" class="contact-details__social-svg">
                <path :d="getSocialIcon(link.platform)" />
              </svg>
              <span v-else class="contact-details__social-fallback">{{ (platformLabels[link.platform] || link.platform).charAt(0) }}</span>
            </a>
          </div>
        </aside>
      </div>
    </section>

    <!-- BlockMap -->
    <section class="reveal py-16 px-6 contact-map-block">
      <div class="max-w-6xl mx-auto">
        <h2 v-if="page?.mapHeading" class="text-3xl font-bold mb-8 text-center text-(--color-text)">{{ page.mapHeading }}</h2>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start">
          <!-- Map column -->
          <div class="lg:col-span-3">
            <iframe
              v-if="safeEmbedUrl"
              :src="safeEmbedUrl"
              class="contact-map"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Office location map"
              allowfullscreen
            />
            <div v-else class="contact-map-placeholder">
              <svg
                class="contact-map-placeholder__pin"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p v-if="page?.mapAddress" class="contact-map-placeholder__address whitespace-pre-line">{{ page.mapAddress }}</p>
              <p class="contact-map-placeholder__note">Interactive map coming soon</p>
            </div>
          </div>

          <!-- Address column -->
          <aside class="lg:col-span-2 contact-details">
            <div v-if="page?.mapAddress" class="contact-details__item">
              <p class="contact-details__label">Address</p>
              <p class="contact-details__value whitespace-pre-line">{{ page.mapAddress }}</p>
            </div>
            <div v-if="page?.mapPhone" class="contact-details__item">
              <p class="contact-details__label">Phone</p>
              <a :href="`tel:${page.mapPhone.replace(/[^0-9+]/g, '')}`" class="contact-details__value">{{ page.mapPhone }}</a>
            </div>
            <div v-if="page?.mapEmail" class="contact-details__item">
              <p class="contact-details__label">Email</p>
              <a :href="`mailto:${page.mapEmail}`" class="contact-details__value">{{ page.mapEmail }}</a>
            </div>
            <p v-if="page?.mapAppointmentNote" class="contact-map__appointment">{{ page.mapAppointmentNote }}</p>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ─── Block backgrounds for visual rhythm ───────────────────────────── */
.contact-text {
  background-color: var(--color-bg);
}
.contact-form-block {
  background-color: var(--color-bg-secondary);
}
.contact-map-block {
  background-color: var(--color-bg);
}

/* ─── Form ───────────────────────────────────────────────────────────── */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-form__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .contact-form__row {
    grid-template-columns: 1fr 1fr;
  }
}

.contact-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.contact-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.contact-form__required {
  color: var(--color-danger);
  margin-left: 0.125rem;
}

.contact-form__optional {
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: 0.25rem;
}

.contact-form__input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background-color: var(--color-bg-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.contact-form__input:hover {
  border-color: var(--color-border-light);
}

.contact-form__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.contact-form__textarea {
  resize: vertical;
  min-height: 8rem;
}

.contact-form__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.contact-form__submit {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.contact-form__submit:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.contact-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contact-form__note {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.contact-form__status {
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.contact-form__status--success {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid color-mix(in srgb, var(--color-success) 35%, transparent);
}

.contact-form__status--error {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  border: 1px solid color-mix(in srgb, var(--color-danger) 35%, transparent);
}

/* ─── Details column (used by both BlockContact + BlockMap) ─────────── */
.contact-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-details__item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.contact-details__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0;
}

.contact-details__value {
  font-size: 1rem;
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

a.contact-details__value {
  text-decoration: none;
  transition: color 0.2s ease;
}

a.contact-details__value:hover {
  color: var(--color-primary);
}

/* Warm note + social links — only on the BlockContact column */
.contact-details__warm-note {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  font-style: italic;
  line-height: 1.5;
}

.contact-details__social {
  display: flex;
  gap: 0.625rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.contact-details__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.contact-details__social-link:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.contact-details__social-link:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: 2px;
}

.contact-details__social-svg {
  width: 1rem;
  height: 1rem;
}

.contact-details__social-fallback {
  font-size: 0.75rem;
  font-weight: 700;
}

/* ─── Map ────────────────────────────────────────────────────────────── */
.contact-map {
  width: 100%;
  height: 400px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  display: block;
}

.contact-map-placeholder {
  width: 100%;
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius);
}

.contact-map-placeholder__pin {
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.contact-map-placeholder__address {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
}

.contact-map-placeholder__note {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0;
}

.contact-map__appointment {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}
</style>
