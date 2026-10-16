import { createApp } from 'vue';
import { createPinia } from 'pinia';
// @unhead/vue v2 moved the Vue-plugin-compatible createHead into the
// /client subpath; the top-level @unhead/vue export now points at the
// framework-agnostic createUnhead which isn't directly usable as
// app.use(). GHSA-5339-hvwr-7582 (XSS in useHeadSafe) is patched at
// unhead >= 2.1.11, only reachable via @unhead/vue 2.x.
import { createHead } from '@unhead/vue/client';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';
import { prefetchSanity } from './composables/useSanity';
import { SITE_SETTINGS_QUERY, NAVIGATION_QUERY, pageQuery } from './composables/siteQueries';

// Start what the first paint needs right away. Otherwise the layout waits for
// settings and navigation, and only then does the page mount and ask for its
// own content — two round trips in a row before anything appears.
prefetchSanity(SITE_SETTINGS_QUERY);
prefetchSanity(NAVIGATION_QUERY);
if (window.location.pathname === '/') {
  prefetchSanity(pageQuery('/'));
  // The router loads the page's code lazily, after the layout is ready.
  // Asking for it now downloads it alongside the data.
  void import('./pages/Home.vue');
}

const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(pinia);
app.use(router);
app.use(head);

app.mount('#app');

// Initialize Sentry only when a DSN is configured. Skipping in local dev
// (no VITE_SENTRY_DSN set) keeps the console clean and avoids sending
// dev-time errors to the production Sentry project. Loaded after the page
// is up so it doesn't compete with the first paint (see src/sentry.ts).
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  const startSentry = () => {
    import('./sentry')
      .then(({ initSentry }) => initSentry(app, router, sentryDsn))
      .catch(() => {});
  };
  // A few seconds after load, when the browser is idle: starting Sentry's
  // recorder is one long task, and it shouldn't land while the page is
  // still settling.
  const whenIdle = () =>
    setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(startSentry, { timeout: 3000 });
      else startSentry();
    }, 4000);
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

// Allow Space key to activate links (a tags) for keyboard accessibility.
// Native <a> elements only respond to Enter; this adds Space parity with <button>.
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target instanceof HTMLAnchorElement) {
    e.preventDefault();
    e.target.click();
  }
});

