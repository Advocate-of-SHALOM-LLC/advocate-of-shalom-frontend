// Shared Sentry helper for Netlify Functions.
//
// Lives outside netlify/functions/ so Netlify's function bundler never
// considers it a handler. Each function file imports `initSentry` +
// `captureError` and calls them in its top-level scope + error paths.
//
// Behavior when SENTRY_DSN is unset: everything is a no-op. Safe to import
// unconditionally from any function; local dev without a Sentry project
// won't error and won't emit spurious network requests.

import * as Sentry from '@sentry/node';

let initialized = false;

/**
 * Initialize Sentry for the current serverless invocation. Safe to call
 * repeatedly — subsequent calls short-circuit. Skips init when the DSN
 * env var is missing so local dev / previews without Sentry config just
 * work.
 */
export function initSentry(): void {
  if (initialized) return;
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'production',
    // Backend traces per user action (form submits, deploy button clicks),
    // not per page load — volume is naturally low, so 100% is fine.
    tracesSampleRate: 1.0,
    // Attach runtime tag so backend events are filterable in the dashboard
    // separately from frontend @sentry/vue events.
    initialScope: {
      tags: { runtime: 'netlify-functions' },
    },
  });

  initialized = true;
}

/**
 * Capture an exception + flush before the caller's response returns.
 *
 * Serverless containers can be frozen the instant the handler resolves,
 * cutting off any in-flight I/O. Sentry batches events and sends them
 * asynchronously, so without an explicit flush the event may never leave
 * the function. The 2 sec cap is a compromise: err on dropping an event
 * vs delaying the user-facing response indefinitely.
 *
 * Optional context is attached as a Sentry scope, useful for tagging which
 * function + what stage the error came from.
 */
export async function captureError(
  err: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  if (!initialized) return;

  Sentry.withScope((scope) => {
    if (context) scope.setContext('function', context);
    Sentry.captureException(err);
  });

  await Sentry.flush(2000).catch(() => undefined);
}
