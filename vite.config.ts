import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { fileURLToPath, URL } from 'node:url';

// Sentry source map upload is only wired when SENTRY_AUTH_TOKEN is present
// in the build environment. Absent token → generate no source maps and
// skip the plugin entirely (safe for local dev + PRs on forks without the
// secret). Present token → maps are generated, uploaded to Sentry, and
// deleted from the dist folder so they don't get shipped to the public.
const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !sentryEnabled,
      // Delete .map files from dist after successful upload — Sentry has them
      // for stack-trace resolution; no reason to serve them publicly.
      sourcemaps: {
        filesToDeleteAfterUpload: ['./dist/**/*.js.map'],
      },
    }),
  ],
  build: {
    // 'hidden' generates .map files (so the Sentry plugin can upload them)
    // but omits the //# sourceMappingURL= comment from the .js output. Without
    // that comment, browsers don't try to fetch the .map files we then delete
    // — no 404 chase, no "source map error" DevTools noise. Sentry doesn't
    // need the comment either; it resolves stack traces server-side using the
    // maps we uploaded.
    sourcemap: sentryEnabled ? 'hidden' : false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
