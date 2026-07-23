import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@unhead/vue';
import * as Sentry from '@sentry/vue';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(pinia);
app.use(router);
app.use(head);

// Initialize Sentry only when a DSN is configured. Skipping in local dev
// (no VITE_SENTRY_DSN set) keeps the console clean and avoids sending
// dev-time errors to the production Sentry project.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    app,
    dsn: sentryDsn,
    // Env tag — set VITE_SENTRY_ENV per Netlify context (production, staging,
    // deploy-preview) so the Sentry dashboard can filter. Falls back to Vite's
    // built-in MODE when the env var isn't set.
    environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    // Sample rates — low-traffic site, so 100% traces is fine. Session Replay
    // is throttled: 10% of normal sessions, 100% of sessions where an error
    // occurred. Adjust downward if quota becomes a concern.
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Only add distributed-tracing headers to requests hitting our own origins
    // — never to third parties (Sanity, Google Maps, etc). Sanity+YouTube+etc.
    // would just ignore the sentry-trace header, but there's no reason to leak
    // instrumentation to them.
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/advocateofshalom\.com/,
      /^https:\/\/[^/]*\.netlify\.app/,
    ],
    // Capture console.log/warn/error as Sentry logs (opt-in feature).
    enableLogs: true,
  });
}

app.mount('#app');

// Allow Space key to activate links (a tags) for keyboard accessibility.
// Native <a> elements only respond to Enter; this adds Space parity with <button>.
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target instanceof HTMLAnchorElement) {
    e.preventDefault();
    e.target.click();
  }
});

