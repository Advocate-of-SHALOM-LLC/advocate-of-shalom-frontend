import { ref, watch } from 'vue';

// Preview-time override for A/B story version. Survives page navigation via
// localStorage. When null, the page falls back to the storyVersion field
// published in Sanity. Set by the FloatingVersionToggle UI.

type StoryVersion = 'full' | 'alludes';

const STORAGE_KEY = 'aos:story-version-override';

function readInitial(): StoryVersion | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'full' || raw === 'alludes' ? raw : null;
  } catch {
    return null;
  }
}

const override = ref<StoryVersion | null>(readInitial());

watch(override, (v) => {
  if (typeof window === 'undefined') return;
  try {
    if (v === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // localStorage may be blocked; the in-memory state still works for this session.
  }
});

export function useStoryVersion() {
  return {
    override,
    setOverride: (v: StoryVersion | null) => {
      override.value = v;
    },
    clearOverride: () => {
      override.value = null;
    },
  };
}
