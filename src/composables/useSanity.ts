import { ref, onMounted, type Ref } from 'vue'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01'

function buildUrl(query: string, params?: Record<string, unknown>): string {
  const base = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`
  const url = new URL(base)
  url.searchParams.set('query', query)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(`$${key}`, JSON.stringify(value))
    }
  }
  return url.toString()
}

async function fetchResult(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const json = await res.json()
  return json.result
}

// Requests started before the component that needs them mounts (see
// prefetchSanity). Each is handed to the first useSanity call with the same
// query and then forgotten, so later visits to a page still fetch fresh.
const prefetched = new Map<string, Promise<unknown>>()

/**
 * Starts a query now, so the response is already on its way when the
 * component that uses it mounts. Called from main.ts for what every first
 * paint needs, which otherwise waits for the layout to render before the
 * page even asks for its content.
 */
export function prefetchSanity(query: string, params?: Record<string, unknown>): void {
  if (!projectId) return
  const url = buildUrl(query, params)
  if (prefetched.has(url)) return
  const request = fetchResult(url)
  // A prefetch nobody ends up using must not surface as an unhandled rejection;
  // the component that does use it still sees the error.
  request.catch(() => {})
  prefetched.set(url, request)
}

/**
 * Reactive composable for fetching data from Sanity CMS via the CDN API.
 *
 * Returns null without fetching if VITE_SANITY_PROJECT_ID is not set,
 * allowing static defaults to show in the template.
 */
export function useSanity<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
): { data: Ref<T | null>; loading: Ref<boolean>; error: Ref<string | null> } {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    if (!projectId) {
      loading.value = false
      return
    }
    try {
      const url = buildUrl(query, params)
      const request = prefetched.get(url) ?? fetchResult(url)
      prefetched.delete(url)
      data.value = (await request) as T
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  })

  return { data, loading, error }
}