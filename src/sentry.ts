import type { App } from 'vue';
import type { Router } from 'vue-router';
import * as Sentry from '@sentry/vue';

/**
 * Error and performance monitoring. Loaded from main.ts once the page has
 * finished loading and the browser is idle: Sentry, and its Session Replay
 * recorder in particular, is about half of the site's JavaScript, and
 * loading it up front held back the first paint on phones. Errors in the
 * first second or two of a visit, before this runs, aren't reported.
 */
export function initSentry(app: App, router: Router, dsn: string) {
  Sentry.init({
    app,
    dsn,
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
