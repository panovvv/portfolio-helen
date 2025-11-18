<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import { useState } from "#imports";
import galleryMetadata from "~/assets/gallery_metadata.json";
import FadePreloadImg from "~/components/FadePreloadImg.vue";

interface GalleryMeta {
  filename: string;
  alt?: string;
}
interface Slide {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const { t, locale } = useI18n();
const galleryItems = galleryMetadata as GalleryMeta[];

function dlog(...args: any[]) {
  // console.log("[HomeSlides]", ...args);
}

const slides = computed<Slide[]>(() => {
  const _ = locale.value;
  return galleryItems.map((meta) => ({
    src: `/gallery/${meta.filename}`,
    alt: meta?.alt ? t(meta.alt) : "",
  }));
});

const displayed = useState<number[]>("homeDisplayed", () => {
  const count = galleryItems.length;
  const used = new Set<number>();
  const arr: number[] = [];
  for (let i = 0; i < 3; i++) {
    const pick = uniqueRandomIndex(used, count);
    arr[i] = pick;
    used.add(pick);
  }
  return arr;
});
let timer: ReturnType<typeof setTimeout> | null = null;
let lastChangedCol: number = -1;

// Whether this page is currently active. Used to gate timers and preloads.
const isActive = ref(false);

// Track readiness of visible images and plan-driven cycles
const readyCols = ref<Set<number>>(new Set());
const hasStarted = ref(false);
const pendingCol = ref<number | null>(null);
let cycleStartTs = 0;
let lastTransitionEndTs = 0;
// Column currently performing a transition (used to match transitioned event)
const activeTransitionCol = ref<number | null>(null);
// Per-column play triggers to start the 1s crossfade when scheduled
const playKeys = ref<number[]>([0, 0, 0]);

function uniqueRandomIndex(exclude: Set<number>, max: number): number {
  const available: number[] = [];
  for (let i = 0; i < max; i++) if (!exclude.has(i)) available.push(i);
  if (available.length === 0) return Math.floor(Math.random() * max);
  return available[Math.floor(Math.random() * available.length)];
}

// Decide which column to change next according to current mode, avoiding changing same column twice
function pickNextCol(): number {
  if (colMode.value === 1) return 1; // only center is visible
  if (colMode.value === 2) {
    const visibleCols = [0, 1];
    const candidates =
      lastChangedCol !== -1 && visibleCols.includes(lastChangedCol)
        ? visibleCols.filter((c) => c !== lastChangedCol)
        : visibleCols;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  // 3 columns
  if (lastChangedCol === -1) return Math.floor(Math.random() * 3);
  const candidates = [0, 1, 2].filter((c) => c !== lastChangedCol);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// --- Non-repeating pool (bag) of indices ---
let unusedPool: number[] = [];
function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
function buildPool(): number[] {
  const count = slides.value.length;
  const exclude = new Set<number>(displayed.value);
  const pool: number[] = [];
  for (let i = 0; i < count; i++) {
    if (!exclude.has(i)) pool.push(i);
  }
  shuffleInPlace(pool);
  return pool;
}
function takeFromPoolOrFallback(col: number): number {
  // Try to take a candidate that is not currently displayed and not yet used in this cycle
  while (unusedPool.length > 0) {
    const idx = unusedPool.pop() as number;
    // Safety: ensure it's not currently displayed in any column
    if (!displayed.value.includes(idx)) return idx;
  }
  // Pool exhausted; rebuild excluding currently displayed
  unusedPool = buildPool();
  if (unusedPool.length > 0) {
    const idx = unusedPool.pop() as number;
    if (!displayed.value.includes(idx)) return idx;
  }
  // Fallback to previous random-exclusion logic (handles very small galleries)
  const count = slides.value.length;
  const exclude = new Set<number>(displayed.value.filter((_, i) => i !== col));
  exclude.add(displayed.value[col]);
  return uniqueRandomIndex(exclude, count);
}

function pickNextIdxForCol(col: number): number {
  return takeFromPoolOrFallback(col);
}

function planAndStartPreload() {
  if (!isActive.value) return;
  // Choose next change (column + index), set prop to start component-level preload
  const col = pickNextCol();
  const nextIdx = pickNextIdxForCol(col);
  pendingCol.value = col;
  cycleStartTs =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  dlog("planAndStartPreload", { col, nextIdx });
  // Setting displayed triggers FadePreloadImg to preload back buffer and then crossfade
  displayed.value[col] = nextIdx;
}

function scheduleNextAfter(elapsedMs: number, preloadEndNow: number) {
  stop();
  if (!isActive.value) return;
  const baseDelay = Math.max(0, 3000 - Math.max(0, Math.floor(elapsedMs)));
  const sinceLastTransitionEnd = preloadEndNow - lastTransitionEndTs;
  const gapDelay = Math.max(
    0,
    3000 - Math.max(0, Math.floor(sinceLastTransitionEnd)),
  );
  const delay = Math.max(baseDelay, gapDelay);
  dlog("scheduleNextAfter", {
    elapsedMs,
    preloadEndNow,
    sinceLastTransitionEnd,
    delay,
  });
  timer = setTimeout(function fire() {
    if (!isActive.value) return;
    // Enforce hard minimum of 3000 ms since the last transition ended
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const sinceEnd = now - lastTransitionEndTs;
    if (sinceEnd < 3000) {
      // Re-schedule only for the remaining time
      const remaining = 3000 - sinceEnd;
      dlog("too soon since last transition, rescheduling", { remaining });
      timer = setTimeout(fire, remaining);
      return;
    }
    // Trigger the 1s crossfade for the pending column
    if (pendingCol.value !== null) {
      const col = pendingCol.value;
      // mark active transition column before pendingCol gets overwritten by next preload
      activeTransitionCol.value = col;
      // bump playKey using array replacement to ensure reactivity
      const nextKeys = playKeys.value.slice();
      nextKeys[col] = (nextKeys[col] || 0) + 1;
      playKeys.value = nextKeys;
      lastChangedCol = col;
      dlog("fire transition", { col, playKey: nextKeys[col] });
    } else {
      dlog("no pendingCol at fire time");
    }
    // Immediately start preloading the next image for the next cycle (only for 2/3-col modes)
    if (colMode.value !== 1) {
      planAndStartPreload();
    }
  }, delay);
}

function stop() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    dlog("stopped timer");
  }
}

const colMode = ref<1 | 2 | 3>(3);
function updateColMode() {
  if (typeof window !== "undefined") {
    const w = window.innerWidth;
    const prev = colMode.value;
    if (w < 640)
      colMode.value = 1; // narrowest
    else if (w < 1024)
      colMode.value = 2; // medium
    else colMode.value = 3; // wide
    if (prev !== colMode.value)
      dlog("colMode changed", {
        prev,
        next: colMode.value,
      });
  }
}

const neededReady = computed(() => (colMode.value === 1 ? 1 : colMode.value));

watch(colMode, () => {
  // Reset lastChangedCol when layout mode changes to avoid wrong exclusions
  lastChangedCol = -1;
  // Re-evaluate readiness for new layout: keep only relevant cols
  const keep = new Set<number>();
  if (colMode.value === 1) keep.add(1);
  else if (colMode.value === 2) {
    keep.add(0);
    keep.add(1);
  } else {
    keep.add(0);
    keep.add(1);
    keep.add(2);
  }
  readyCols.value = new Set([...readyCols.value].filter((c) => keep.has(c)));

  // Rebuild the non-repeating pool based on current displayed set
  unusedPool = buildPool();

  // If not started yet and we already have enough, start
  if (!hasStarted.value && readyCols.value.size >= neededReady.value) {
    hasStarted.value = true;
    planAndStartPreload();
  }
});

function onReadyForCol(col: number) {
  if (!isActive.value) return;
  dlog("onReadyForCol", { col });
  readyCols.value.add(col);
  if (!hasStarted.value && readyCols.value.size >= neededReady.value) {
    hasStarted.value = true;
    // Initialize lastTransitionEndTs baseline at start
    lastTransitionEndTs =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    // Initialize non-repeating pool before starting the cycle
    unusedPool = buildPool();
    planAndStartPreload();
  }
}

function onPreloadedForCol(col: number) {
  if (!isActive.value) return;
  if (pendingCol.value === null || col !== pendingCol.value) return;
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const elapsed = now - cycleStartTs;
  dlog("onPreloadedForCol", { col, elapsed });
  scheduleNextAfter(elapsed, now);
}

function onTransitionedForCol(col: number) {
  if (!isActive.value) return;
  // Match the column that is actually transitioning, regardless of pendingCol changes
  if (activeTransitionCol.value === null || col !== activeTransitionCol.value)
    return;
  lastTransitionEndTs =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  dlog("onTransitionedForCol", { col });
  // Clear active transition marker
  activeTransitionCol.value = null;
  // In 1-column mode, start preloading the next image only after the transition ends
  if (colMode.value === 1) {
    planAndStartPreload();
  }
}

onMounted(() => {
  isActive.value = true;
  updateColMode();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateColMode);
    const onVis = () => {
      if (document.visibilityState === "visible") {
        dlog("visibility visible");
        // Clear any potentially stale timer and resume the cycle deterministically
        stop();
        const now =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        // If a preload is pending, schedule transition respecting min gap
        if (pendingCol.value !== null) {
          scheduleNextAfter(0, now);
        } else {
          // If idle, kick off a new preload cycle (for any column mode)
          planAndStartPreload();
        }
      } else {
        dlog("visibility hidden");
      }
    };
    document.addEventListener("visibilitychange", onVis);
    // Store reference on window to remove later (avoid extra ref vars)
    (window as any).__homeOnVis = onVis;
  }
  // Wait for initial visible images to be ready via @ready events before starting.
});

onBeforeRouteLeave(() => {
  // Stop immediately when navigating away to prevent further network activity
  isActive.value = false;
  stop();
});

onBeforeUnmount(() => {
  isActive.value = false;
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateColMode);
    const onVis = (window as any).__homeOnVis;
    if (onVis) document.removeEventListener("visibilitychange", onVis);
  }
  stop();
});
</script>

<template>
  <section class="container mx-auto p-4">
    <div class="flex flex-col gap-6">
      <div class="text-center max-w-4xl mx-auto">
        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
        >
          <span>{{ t("home.title") }}</span>
        </h1>
        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
        >
          <span>{{ t("home.name") }}</span>
        </h1>

        <p
          class="mt-3 text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200"
        >
          {{ t("home.subtitle") }}
        </p>

        <h2
          class="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold"
          v-html="t('home.tagline')"
        ></h2>
      </div>

      <div class="relative w-full overflow-hidden rounded-lg shadow-md">
        <div class="w-full bg-gray-100 dark:bg-gray-800 mx-auto">
          <div v-if="colMode === 1" class="flex items-center justify-center">
            <FadePreloadImg
              v-if="slides[displayed[1]]"
              :src="slides[displayed[1]].src"
              :alt="slides[displayed[1]].alt"
              :width="slides[displayed[1]].width"
              :height="slides[displayed[1]].height"
              :durationMs="1000"
              :playKey="playKeys[1]"
              @ready="onReadyForCol(1)"
              @preloaded="onPreloadedForCol(1)"
              @transitioned="onTransitionedForCol(1)"
            />
          </div>
          <div v-else-if="colMode === 2" class="grid grid-cols-2 gap-2">
            <div
              v-for="(idx, col) in [displayed[0], displayed[1]]"
              :key="`col-2-${col}`"
              class="flex items-center justify-center"
            >
              <FadePreloadImg
                v-if="slides[idx]"
                :src="slides[idx].src"
                :alt="slides[idx].alt"
                :width="slides[idx].width"
                :height="slides[idx].height"
                :durationMs="1000"
                :playKey="playKeys[col]"
                @ready="onReadyForCol(col)"
                @preloaded="onPreloadedForCol(col)"
                @transitioned="onTransitionedForCol(col)"
              />
            </div>
          </div>
          <div v-else class="grid grid-cols-3 gap-2">
            <div
              v-for="(idx, col) in displayed"
              :key="`col-3-${col}`"
              class="flex items-center justify-center"
            >
              <FadePreloadImg
                v-if="slides[idx]"
                :src="slides[idx].src"
                :alt="slides[idx].alt"
                :width="slides[idx].width"
                :height="slides[idx].height"
                :durationMs="1000"
                :playKey="playKeys[col]"
                @ready="onReadyForCol(col)"
                @preloaded="onPreloadedForCol(col)"
                @transitioned="onTransitionedForCol(col)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
        <div
          class="order-1 md:order-1 prose prose-lg sm:prose-xl dark:prose-invert max-w-none md:pr-6 prose-p:leading-relaxed prose-li:leading-relaxed prose-p:text-lg sm:prose-p:text-xl prose-li:text-lg sm:prose-li:text-xl md:col-span-2"
        >
          <h3
            class="mt-0 text-2xl sm:text-3xl md:text-4xl font-semibold"
            v-html="t('home.greeting')"
          ></h3>
          <p
            class="mt-2 text-xl sm:text-2xl md:text-2xl leading-relaxed text-gray-900 dark:text-gray-100"
            v-html="t('home.intro')"
          ></p>

          <h4
            class="mt-6 mb-4 text-xl sm:text-2xl md:text-3xl font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300"
            v-html="t('home.you_can_order')"
          ></h4>
          <ul
            class="list-disc pl-5 text-xl sm:text-2xl md:text-2xl leading-relaxed mb-4"
          >
            <li v-html="t('home.orders.marketplaces')"></li>
            <li v-html="t('home.orders.websites')"></li>
            <li v-html="t('home.orders.social')"></li>
            <li v-html="t('home.orders.recipes')"></li>
          </ul>

          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed mb-4"
            v-html="t('home.studio')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed mt-0"
            v-html="t('home.remote')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed"
            v-html="t('home.skills')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed"
            v-html="t('home.props')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed mb-4"
            v-html="t('home.precision')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed"
            v-html="t('home.heart')"
          ></p>
        </div>

        <div
          class="order-2 md:order-2 mt-4 md:mt-0 md:pl-4 self-center w-full md:col-span-1"
        >
          <div class="home-portrait-frame">
            <NuxtImg
              src="/portrait.jpg"
              class="home-portrait w-full h-auto object-cover aspect-[3/4]"
              sizes="160px xs:320px sm:640px md:384px lg:512px xl:640px 2xl:768px 3xl:1024px 4xl:1280px 5xl:1536px 6xl:1920px 7xl:2048px 8xl:2560px 9xl:3072px 10xl:3840px"
              placeholder
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-portrait-frame {
  --home-portrait-shadow-light: rgba(15, 23, 42, 0.18);
  --home-portrait-shadow-dark: rgba(15, 23, 42, 0.55);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 12px 30px var(--home-portrait-shadow-light);
  background: transparent;
}

:global(.dark) .home-portrait-frame {
  box-shadow: 0 12px 30px var(--home-portrait-shadow-dark);
}

.home-portrait {
  display: block;
  width: 100%;
  height: auto;
  border: 0;
  outline: none;
  box-shadow: none;
}

.home-portrait :deep(.nuxt-img-placeholder) {
  display: none;
}
</style>
