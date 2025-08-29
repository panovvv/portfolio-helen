<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useState } from "#imports";
import galleryFiles from "~/assets/gallery_files.json";
import galleryMetadata from "~/assets/gallery_metadata.json";
import FadePreloadImg from "~/components/FadePreloadImg.vue";

interface GalleryFile {
  filename: string;
  width: number;
  height: number;
}
interface GalleryMeta {
  filename: string;
  alt?: string;
}
interface Slide {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const { t } = useI18n();

const slides = computed<Slide[]>(() => {
  const selected = galleryFiles as GalleryFile[];
  return selected.map((f) => {
    const meta = (galleryMetadata as GalleryMeta[]).find(
      (m) => m.filename === f.filename,
    );
    return {
      src: `/gallery/${f.filename}`,
      width: f.width,
      height: f.height,
      alt: meta?.alt || "Home slide",
    };
  });
});

const displayed = useState<number[]>("homeDisplayed", () => {
  const count = (galleryFiles as GalleryFile[]).length;
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

function uniqueRandomIndex(exclude: Set<number>, max: number): number {
  const available: number[] = [];
  for (let i = 0; i < max; i++) if (!exclude.has(i)) available.push(i);
  if (available.length === 0) return Math.floor(Math.random() * max);
  return available[Math.floor(Math.random() * available.length)];
}

function tickOnce() {
  const count = slides.value.length;
  if (count === 0) return;

  // 1-column mode: update center slot
  if (colMode.value === 1) {
    const exclude = new Set<number>([displayed.value[1]]);
    displayed.value[1] = uniqueRandomIndex(exclude, count);
    return;
  }

  // 2-column mode: update among columns 0 and 1, avoid repeating the same column consecutively
  if (colMode.value === 2) {
    const visibleCols = [0, 1];
    const candidates =
      lastChangedCol !== -1 && visibleCols.includes(lastChangedCol)
        ? visibleCols.filter((c) => c !== lastChangedCol)
        : visibleCols;
    const col = candidates[Math.floor(Math.random() * candidates.length)];
    const others = new Set<number>(displayed.value.filter((_, i) => i !== col));
    const nextIdx = uniqueRandomIndex(others, count);
    displayed.value[col] = nextIdx;
    lastChangedCol = col;
    return;
  }

  // 3-column mode: update among all columns, avoid repeating the same column consecutively
  let col: number;
  if (lastChangedCol === -1) {
    col = Math.floor(Math.random() * 3);
  } else {
    const candidates = [0, 1, 2].filter((c) => c !== lastChangedCol);
    col = candidates[Math.floor(Math.random() * candidates.length)];
  }
  const others = new Set<number>(displayed.value.filter((_, i) => i !== col));
  const nextIdx = uniqueRandomIndex(others, count);
  displayed.value[col] = nextIdx;
  lastChangedCol = col;
}

function schedule() {
  stop();
  const delay = 2000;
  timer = setTimeout(() => {
    tickOnce();
    schedule();
  }, delay);
}

function start() {
  // initial random indices are seeded via useState in setup to avoid first-render flash
  schedule();
}
function stop() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

const colMode = ref<1 | 2 | 3>(3);
function updateColMode() {
  if (typeof window !== "undefined") {
    const w = window.innerWidth;
    if (w < 640)
      colMode.value = 1; // narrowest
    else if (w < 1024)
      colMode.value = 2; // medium
    else colMode.value = 3; // wide
  }
}

watch(colMode, () => {
  // Reset lastChangedCol when layout mode changes to avoid wrong exclusions
  lastChangedCol = -1;
});

onMounted(() => {
  updateColMode();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateColMode);
  }
  start();
});
onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateColMode);
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
              sizes="100vw"
              :durationMs="1000"
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
                sizes="(max-width: 1024px) 50vw, 50vw"
                :durationMs="1000"
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
                sizes="(max-width: 1024px) 33vw, 33vw"
                :durationMs="1000"
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
          class="order-2 md:order-2 mt-4 md:mt-0 md:pl-4 overflow-hidden self-center w-full md:col-span-1 rounded-lg shadow-md"
        >
          <NuxtImg
            src="/portrait.jpg"
            class="w-full h-auto object-cover aspect-[3/4] rounded-lg"
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Transition handled inside FadePreloadImg for zero-flicker crossfades */
</style>
