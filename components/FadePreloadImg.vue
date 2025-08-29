<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from "vue";

interface Props {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  durationMs?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "ready"): void;
  (e: "preloaded"): void;
  (e: "transitioned"): void;
}>();

// Two persistent buffers. We never remove them; we just flip roles.
const buf0Src = ref<string>(props.src);
const buf1Src = ref<string>(props.src);

// Track load states for each buffer (determined by actual <img> element load)
const buf0Loaded = ref<boolean>(false);
const buf1Loaded = ref<boolean>(false);

// Refs to wrapper elements containing the NuxtImg-rendered <img>
const buf0Wrap = ref<HTMLDivElement | null>(null);
const buf1Wrap = ref<HTMLDivElement | null>(null);

function getImgEl(buffer: 0 | 1): HTMLImageElement | null {
  const wrap = buffer === 0 ? buf0Wrap.value : buf1Wrap.value;
  if (!wrap) return null;
  const el = wrap.querySelector("img");
  return (el as HTMLImageElement) || null;
}

async function waitForImgLoad(buffer: 0 | 1): Promise<void> {
  const el = getImgEl(buffer);
  if (!el) {
    // Wait for DOM to update and try again
    await nextTick();
    return waitForImgLoad(buffer);
  }
  if (el.complete && (el as any).naturalWidth > 0) {
    if (buffer === 0) buf0Loaded.value = true;
    else buf1Loaded.value = true;
    return;
  }
  await new Promise<void>((resolve) => {
    const onLoad = () => {
      el.removeEventListener("load", onLoad as any);
      if (buffer === 0) buf0Loaded.value = true;
      else buf1Loaded.value = true;
      resolve();
    };
    el.addEventListener("load", onLoad as any, { once: true } as any);
  });
}

// 0 or 1: which buffer is currently visible (on top after transition completes)
const front = ref<0 | 1>(0);
const back = computed<0 | 1>(() => (front.value === 0 ? 1 : 0));

const isTransitioning = ref(false);

// Maintain an aspect-ratio box for layout without downloading a sizer image
const frontWidth = ref<number | undefined>(props.width);
const frontHeight = ref<number | undefined>(props.height);
let pendingBackWidth: number | undefined = undefined;
let pendingBackHeight: number | undefined = undefined;

const aspectPadding = computed(() => {
  const w = frontWidth.value || 3;
  const h = frontHeight.value || 2;
  const pct = (h / w) * 100;
  return pct + "%";
});

const duration = () =>
  props.durationMs && props.durationMs > 0 ? props.durationMs : 1000;

// Emit ready once when the initial image (either buffer) loads
const hasEmittedReady = ref(false);
async function ensureInitialReady() {
  if (hasEmittedReady.value) return;
  // Wait for currently visible buffer's <img>
  await waitForImgLoad(front.value);
  if (!hasEmittedReady.value) {
    hasEmittedReady.value = true;
    emit("ready");
  }
}

onMounted(() => {
  // After initial mount, ensure we emit ready once the current image loads
  ensureInitialReady();
});

function setBackSrc(newSrc: string) {
  if (back.value === 0) {
    buf0Src.value = newSrc;
    buf0Loaded.value = false;
  } else {
    buf1Src.value = newSrc;
    buf1Loaded.value = false;
  }
}

function isBackLoaded(): boolean {
  return back.value === 0 ? buf0Loaded.value : buf1Loaded.value;
}

// Queue for incoming src while a transition is in progress
let pendingRequest: { src: string; width?: number; height?: number } | null =
  null;

async function processSrcChange(newSrc: string, w?: number, h?: number) {
  // If already showing or already queued in back, ignore
  if (newSrc === (front.value === 0 ? buf0Src.value : buf1Src.value)) return;
  if (newSrc === (back.value === 0 ? buf0Src.value : buf1Src.value)) return;

  // Capture incoming dimensions for the back buffer (to apply after flip)
  pendingBackWidth = w;
  pendingBackHeight = h;

  setBackSrc(newSrc);

  // Wait for the back image to load
  await waitForImgLoad(back.value);

  // Notify parent that the new image finished preloading in the back buffer
  emit("preloaded");

  // Ensure a paint at opacity 0 before we start crossfade
  await nextTick();
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  );

  // Start crossfade: back 0->1, front 1->0
  isTransitioning.value = true;

  // After transition duration, flip buffers and sync sizer/aspect
  setTimeout(() => {
    // End the CSS transition atomically: exit transitioning and commit the new front
    isTransitioning.value = false;
    front.value = back.value;
    // Apply the pending back dimensions to the front for stable aspect
    frontWidth.value = pendingBackWidth;
    frontHeight.value = pendingBackHeight;

    // Ensure we have emitted ready for the new visible image if not already
    ensureInitialReady();
    // Inform parent that the crossfade transition has completed
    emit("transitioned");

    // If something was queued during the transition, process it now
    if (pendingRequest) {
      const req = pendingRequest;
      pendingRequest = null;
      // Chain the next change
      processSrcChange(req.src, req.width, req.height);
    }
  }, duration());
}

// When prop src changes, preload it into the hidden back buffer via actual <img>
watch(
  () => props.src,
  async (newSrc) => {
    if (!newSrc) return;
    if (isTransitioning.value) {
      // Replace any previous pending request with the latest
      pendingRequest = {
        src: newSrc,
        width: props.width,
        height: props.height,
      };
      return;
    }
    await processSrcChange(newSrc, props.width, props.height);
  },
  { immediate: false },
);
</script>

<template>
  <!-- Wrapper maintains natural image height using a CSS aspect-ratio box (no extra image request) -->
  <div class="relative w-full">
    <!-- Aspect sizer: keeps layout height based on current (front) image -->
    <div
      aria-hidden="true"
      class="block w-full select-none"
      :style="{ paddingTop: aspectPadding }"
    ></div>

    <!-- Buffer 0 -->
    <div
      ref="buf0Wrap"
      class="absolute inset-0 z-0 pointer-events-none"
      :style="{
        opacity:
          front === 0 ? (isTransitioning ? 0 : 1) : isTransitioning ? 1 : 0,
        transition: `opacity ${duration()}ms ease`,
        willChange: 'opacity',
      }"
    >
      <img
        :src="buf0Src"
        :alt="alt || ''"
        class="w-full h-full object-contain object-center block"
        decoding="async"
        loading="eager"
      />
    </div>

    <!-- Buffer 1 -->
    <div
      ref="buf1Wrap"
      class="absolute inset-0 z-10 pointer-events-none"
      :style="{
        opacity:
          front === 1 ? (isTransitioning ? 0 : 1) : isTransitioning ? 1 : 0,
        transition: `opacity ${duration()}ms ease`,
        willChange: 'opacity',
      }"
    >
      <img
        :src="buf1Src"
        :alt="alt || ''"
        class="w-full h-full object-contain object-center block"
        decoding="async"
        loading="eager"
        fetchpriority="high"
      />
    </div>
  </div>
</template>

<style scoped>
/* No additional CSS required; styles are inline for transition timing flexibility */
</style>
