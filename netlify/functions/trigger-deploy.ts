import type { Handler } from '@netlify/functions';
import { initSentry, captureError } from '../lib/sentry';

initSentry();

// Triggers a Netlify build by POSTing to the configured build hook. Called
// from the Sanity Studio "Deploy Site" tool. The shared secret in the
// `x-deploy-secret` header protects the endpoint from anonymous abuse.
//
// Accepts an optional JSON body { "target": "staging" | "production" }.
// Defaults to "production" if absent for backward compatibility.
//
// Studio is hosted on *.sanity.studio (a different origin), so this function
// needs to permit cross-origin requests.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-deploy-secret',
};

const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

type Target = 'production' | 'staging';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secret = event.headers['x-deploy-secret'] ?? event.headers['X-Deploy-Secret'];
  if (!secret || secret !== process.env.DEPLOY_HOOK_SECRET) {
    return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Parse target from body; default to production for backward compat.
  let target: Target = 'production';
  if (event.body) {
    try {
      const parsed = JSON.parse(event.body);
      if (parsed?.target === 'staging') target = 'staging';
    } catch {
      // Malformed body — treat as no body. Default applies.
    }
  }

  const hookUrl =
    target === 'staging'
      ? process.env.NETLIFY_STAGING_DEPLOY_HOOK_URL
      : process.env.NETLIFY_DEPLOY_HOOK_URL;

  if (!hookUrl) {
    const envVarName =
      target === 'staging' ? 'NETLIFY_STAGING_DEPLOY_HOOK_URL' : 'NETLIFY_DEPLOY_HOOK_URL';
    // Config bug — someone rotated env vars without setting the hook URL.
    // Worth an alert so it doesn't sit broken until someone tries the button.
    await captureError(new Error(`Missing env var: ${envVarName}`), {
      function: 'trigger-deploy',
      stage: 'config-check',
      target,
    });
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: `${envVarName} not configured` }),
    };
  }

  try {
    const response = await fetch(hookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      // Netlify's build hook API rejected us — invalid/rotated hook URL, or
      // Netlify itself is degraded. Either way it's a real deploy-button
      // failure worth alerting on.
      await captureError(new Error(`Netlify build hook returned ${response.status}`), {
        function: 'trigger-deploy',
        stage: 'hook.response',
        target,
        status: response.status,
      });
      return {
        statusCode: 502,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          error: 'Netlify build hook returned non-200',
          status: response.status,
          target,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        triggered: true,
        target,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    // Network error reaching Netlify, DNS failure, etc.
    await captureError(err, { function: 'trigger-deploy', stage: 'hook.fetch', target });
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Failed to trigger deploy', detail: String(err), target }),
    };
  }
};
