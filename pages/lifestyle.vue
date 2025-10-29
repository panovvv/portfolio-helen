<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useImage } from "#imports";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faEnvelope,
  faUpRightAndDownLeftFromCenter,
  faDownLeftAndUpRightToCenter,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const { t, locale } = useI18n();

interface GalleryItem {
  previewSrc: string;
  lightboxSrc: string;
  alt?: string;
}

interface LightboxItem {
  src: string;
  alt?: string;
}

interface GallerySection {
  id: string;
  titleKey: string;
  items: GalleryItem[];
}

type FullscreenCapableDocument = Document & {
  fullscreenEnabled?: boolean;
  exitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

const LIGHTBOX_PRELOAD_COUNT = 2;
const SLIDESHOW_INTERVAL_MS = 5000;
const IMAGE_SOURCES = [
  {
    id: "lifestyle-001",
    files: [
      "1_DSC5910.jpg",
      "2_DSC5926.jpg",
      "3_DSC5948-Edit1.jpg",
      "4_DSC5989.jpg",
      "5_DSC5961-Edit1.jpg",
      "6_DSC6019-2.jpg",
      "7_DSC6006.jpg",
      "8_DSC6048.jpg",
      "9_DSC6028-Edit.jpg",
      "10_DSC6053-Edit1.jpg",
      "11_DSC6061.jpg",
      "12_DSC6067-2.jpg",
    ],
  },
  {
    id: "lifestyle-002",
    files: [
      "_DSC1869 copy.jpg",
      "_DSC1878 copy (2) 1.jpg",
      "_DSC1895 copy.jpg",
      "_DSC1902 copy1.jpg",
    ],
  },
  {
    id: "lifestyle-003",
    files: [
      "1_DSC3233.jpg",
      "2_DSC3452.jpg",
      "3_DSC3291.jpg",
      "4_DSC3476-1.jpg",
    ],
  },
  {
    id: "lifestyle-004",
    files: [
      "1_DSC4591 copy.jpg",
      "2_DSC4433 copy.jpg",
      "3_DSC4599 copy.jpg",
      "4_DSC4638 copy.jpg",
    ],
  },
] as const;

const nuxtImg = useImage();

const gallerySections = computed<GallerySection[]>(() =>
  IMAGE_SOURCES.map(({ id, files }) => ({
    id,
    titleKey: `lifestyle.sections.${id}.title`,
    items: files.map((filename) => ({
      previewSrc: `/${id}/${filename}`,
      lightboxSrc: nuxtImg(`/${id}/${filename}`, {
        // Serve a large but optimized asset for the lightbox view
        width: 4096,
        quality: 85,
        format: "webp",
      }),
    })),
  })),
);

const isLightboxOpen = ref(false);
const lightboxItems = ref<LightboxItem[]>([]);
const lightboxStartIndex = ref(0);
const preloadToken = ref(0);
const isFullscreen = ref(false);
const canUseFullscreen = ref(false);
const isSlideshowActive = ref(false);
const slideshowTimer = ref<number | null>(null);
const slideshowProgress = ref(0);
const slideshowProgressStart = ref(0);
let slideshowProgressFrame: number | null = null;

const SLIDESHOW_RING_RADIUS = 22;
const SLIDESHOW_RING_CIRCUMFERENCE = 2 * Math.PI * SLIDESHOW_RING_RADIUS;
const slideshowRingDasharray = SLIDESHOW_RING_CIRCUMFERENCE.toFixed(2);
const slideshowRingDashoffset = computed(() =>
  (SLIDESHOW_RING_CIRCUMFERENCE * (1 - slideshowProgress.value)).toFixed(2),
);

function startSlideshowProgress() {
  if (!isBrowser()) {
    return;
  }
  if (slideshowProgressFrame !== null) {
    window.cancelAnimationFrame(slideshowProgressFrame);
    slideshowProgressFrame = null;
  }
  slideshowProgress.value = 0;
  slideshowProgressStart.value = performance.now();
  slideshowProgressFrame = window.requestAnimationFrame(
    updateSlideshowProgress,
  );
}
function updateSlideshowProgress() {
  if (!isSlideshowActive.value) {
    slideshowProgress.value = 0;
    if (slideshowProgressFrame !== null) {
      window.cancelAnimationFrame(slideshowProgressFrame);
      slideshowProgressFrame = null;
    }
    return;
  }
  if (!isBrowser()) {
    return;
  }
  const now = performance.now();
  const elapsed = now - slideshowProgressStart.value;
  const progress = Math.min(elapsed / SLIDESHOW_INTERVAL_MS, 1);
  slideshowProgress.value = progress;
  if (progress >= 1) {
    slideshowProgress.value = 0;
    slideshowProgressStart.value = now;
  }
  slideshowProgressFrame = window.requestAnimationFrame(
    updateSlideshowProgress,
  );
}
function stopSlideshowProgress() {
  if (!isBrowser()) {
    slideshowProgress.value = 0;
    slideshowProgressFrame = null;
    return;
  }
  slideshowProgress.value = 0;
  if (slideshowProgressFrame !== null) {
    window.cancelAnimationFrame(slideshowProgressFrame);
    slideshowProgressFrame = null;
  }
}
const hasMultipleLightboxItems = computed(() => lightboxItems.value.length > 1);

function isBrowser() {
  return typeof window !== "undefined";
}

function preloadImages(items: LightboxItem[], centerIndex: number) {
  if (!isBrowser() || LIGHTBOX_PRELOAD_COUNT <= 0 || items.length <= 1) {
    return;
  }

  const targets = new Set<string>();
  const total = items.length;

  for (let offset = 1; offset <= LIGHTBOX_PRELOAD_COUNT; offset += 1) {
    const prevIndex = (centerIndex - offset + total) % total;
    const nextIndex = (centerIndex + offset) % total;

    const prevItem = items[prevIndex];
    if (prevIndex !== centerIndex && prevItem?.src) {
      targets.add(prevItem.src);
    }

    const nextItem = items[nextIndex];
    if (nextIndex !== centerIndex && nextItem?.src) {
      targets.add(nextItem.src);
    }
  }

  targets.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function openLightbox(items: GalleryItem[], startAt: number) {
  schedulePreloadCancel();
  lightboxItems.value = items.map(({ lightboxSrc, alt }) => ({
    src: lightboxSrc,
    alt,
  }));
  lightboxStartIndex.value = startAt;
  isLightboxOpen.value = true;
  schedulePreload(startAt);
}

function handleLightboxIndexChange(_oldIndex: number, newIndex: number) {
  lightboxStartIndex.value = newIndex;
  schedulePreload(newIndex);
  if (isSlideshowActive.value) {
    resetSlideshowTimer();
  }
}

function ensureImageLoaded(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
    if (img.complete && img.naturalWidth !== 0) {
      resolve();
    }
  });
}

function schedulePreload(centerIndex: number) {
  if (!isBrowser()) {
    return;
  }
  const items = lightboxItems.value;
  if (!items.length) {
    return;
  }
  const token = ++preloadToken.value;
  const current = items[centerIndex];
  if (!current?.src) {
    return;
  }
  ensureImageLoaded(current.src)
    .then(() => {
      if (token !== preloadToken.value) {
        return;
      }
      preloadImages(items, centerIndex);
    })
    .catch(() => {
      /* ignore load failures; current image already handled by lightbox */
    });
}

function advanceLightbox(step: number) {
  if (!isLightboxOpen.value) {
    return;
  }
  const total = lightboxItems.value.length;
  if (!total) {
    return;
  }
  const target = (lightboxStartIndex.value + step + total) % total;
  lightboxStartIndex.value = target;
  schedulePreload(target);
}

function clearSlideshowTimer() {
  if (slideshowTimer.value !== null) {
    if (typeof window !== "undefined") {
      window.clearInterval(slideshowTimer.value);
    }
    slideshowTimer.value = null;
  }
}

function resetSlideshowTimer() {
  if (!isBrowser()) {
    return;
  }
  clearSlideshowTimer();
  if (
    !isSlideshowActive.value ||
    !isLightboxOpen.value ||
    !hasMultipleLightboxItems.value
  ) {
    return;
  }
  slideshowTimer.value = window.setInterval(() => {
    advanceLightbox(1);
    startSlideshowProgress();
  }, SLIDESHOW_INTERVAL_MS);
  startSlideshowProgress();
}

function startSlideshow() {
  if (
    !isBrowser() ||
    !isLightboxOpen.value ||
    !hasMultipleLightboxItems.value
  ) {
    return;
  }
  if (isSlideshowActive.value) {
    resetSlideshowTimer();
    return;
  }
  isSlideshowActive.value = true;
  resetSlideshowTimer();
}

function stopSlideshow() {
  clearSlideshowTimer();
  stopSlideshowProgress();
  isSlideshowActive.value = false;
}

function toggleSlideshow() {
  if (isSlideshowActive.value) {
    stopSlideshow();
  } else {
    startSlideshow();
  }
}

function getLightboxModal(): HTMLElement | null {
  if (!isBrowser()) {
    return null;
  }
  return document.querySelector<HTMLElement>(".vel-modal");
}

function setFullscreenClass(enabled: boolean) {
  const modal = getLightboxModal();
  if (modal) {
    modal.classList.toggle("is-fullscreen", enabled);
  }
}

async function enterFullscreen() {
  if (!isBrowser()) {
    return;
  }
  const modal = getLightboxModal();
  if (!modal) {
    return;
  }
  const request =
    modal.requestFullscreen ||
    (
      modal as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      }
    ).webkitRequestFullscreen ||
    (
      modal as HTMLElement & {
        msRequestFullscreen?: () => Promise<void> | void;
      }
    ).msRequestFullscreen;
  if (request) {
    try {
      await request.call(modal);
      isFullscreen.value = true;
      setFullscreenClass(true);
    } catch {
      /* ignore request errors */
    }
  }
}

async function exitFullscreen() {
  if (!isBrowser()) {
    return;
  }
  const doc = document as FullscreenCapableDocument;
  const exit =
    doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  if (exit) {
    try {
      await exit.call(doc);
    } catch {
      /* ignore exit errors */
    }
  }
  if (
    !(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement
    )
  ) {
    isFullscreen.value = false;
    setFullscreenClass(false);
  }
}

async function toggleFullscreen() {
  if (!isBrowser()) {
    return;
  }
  if (isFullscreen.value) {
    await exitFullscreen();
  } else {
    await enterFullscreen();
  }
}

function handleFullscreenChange() {
  if (!isBrowser()) {
    return;
  }
  const doc = document as FullscreenCapableDocument;
  const fullscreenElement =
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement ||
    null;
  isFullscreen.value = fullscreenElement !== null;
  setFullscreenClass(isFullscreen.value);
}

function handleLightboxHide() {
  isLightboxOpen.value = false;
  stopSlideshow();
  schedulePreloadCancel();
  if (isFullscreen.value) {
    isFullscreen.value = false;
    exitFullscreen();
  }
  setFullscreenClass(false);
}

function schedulePreloadCancel() {
  preloadToken.value += 1;
}

onMounted(() => {
  if (!isBrowser()) {
    return;
  }
  const doc = document as FullscreenCapableDocument;
  const body = document.body
    ? (document.body as FullscreenCapableElement)
    : undefined;
  canUseFullscreen.value = Boolean(
    doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.msFullscreenEnabled ||
      body?.requestFullscreen ||
      body?.webkitRequestFullscreen ||
      body?.msRequestFullscreen,
  );
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener(
    "webkitfullscreenchange" as any,
    handleFullscreenChange as EventListener,
  );
  document.addEventListener(
    "msfullscreenchange" as any,
    handleFullscreenChange as EventListener,
  );
});

onBeforeUnmount(() => {
  if (!isBrowser()) {
    return;
  }
  schedulePreloadCancel();
  stopSlideshow();
  if (isFullscreen.value) {
    isFullscreen.value = false;
    exitFullscreen();
  }
  setFullscreenClass(false);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  document.removeEventListener(
    "webkitfullscreenchange" as any,
    handleFullscreenChange as EventListener,
  );
  document.removeEventListener(
    "msfullscreenchange" as any,
    handleFullscreenChange as EventListener,
  );
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="page-heading">{{ t("lifestyle.title") }}</h1>
    <hr class="section-sep" />

    <section
      v-for="section in gallerySections"
      :key="`${locale}-${section.id}`"
      class="lifestyle-section"
    >
      <h2 class="section-heading">
        {{ t(section.titleKey) }}
      </h2>
      <div class="gallery-grid">
        <div
          v-for="(img, index) in section.items"
          :key="img.previewSrc"
          class="gallery-tile"
          role="button"
          tabindex="0"
          :aria-label="img.alt ? t(img.alt) : t(section.titleKey)"
          @click="openLightbox(section.items, index)"
          @keydown.enter.prevent="openLightbox(section.items, index)"
        >
          <NuxtImg
            :src="img.previewSrc"
            :alt="img.alt ? t(img.alt) : ''"
            sizes="160px xs:320px lg:640px"
            densities="x1 x2"
            loading="lazy"
            placeholder
            quality="60"
            format="webp"
          />
        </div>
      </div>
    </section>

    <hr class="section-sep" />
    <!-- Footer / Contact block specific for Lifestyle page -->
    <div class="mt-10 mb-6">
      <p
        class="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300"
      >
        © Elena Panova | Stock & Lifestyle Photography
      </p>
      <div
        class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
      >
        <a
          href="mailto:panovaed89@gmail.com"
          class="flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full sm:w-auto"
        >
          <FontAwesomeIcon
            :icon="faEnvelope"
            class="mr-3 text-blue-500 text-2xl align-middle relative top-[2px] shrink-0"
          />
          <span class="align-middle leading-none">panovaed89@gmail.com</span>
        </a>
        <a
          href="https://www.instagram.com/panipanovahelen/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full sm:w-auto"
        >
          <FontAwesomeIcon
            :icon="faInstagram"
            class="mr-3 text-pink-500 text-2xl align-middle relative top-[2px] shrink-0"
          />
          <span class="align-middle leading-none">@panipanovahelen</span>
        </a>
      </div>
    </div>
    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="lightboxItems"
      :index="lightboxStartIndex"
      :loop="true"
      :zoom-scale="0.25"
      :move-disabled="true"
      :rotate-disabled="true"
      @hide="handleLightboxHide"
      @on-index-change="handleLightboxIndexChange"
    />
    <Teleport
      v-if="isLightboxOpen && (canUseFullscreen || hasMultipleLightboxItems)"
      to=".vel-modal"
    >
      <div class="lightbox-controls">
        <button
          v-if="hasMultipleLightboxItems"
          type="button"
          class="lightbox-control-btn"
          :aria-pressed="isSlideshowActive"
          @click="toggleSlideshow"
        >
          <span v-show="isSlideshowActive" class="lightbox-control-progress">
            <svg viewBox="0 0 48 48" class="lightbox-control-progress__svg">
              <circle
                class="lightbox-control-progress__track"
                cx="24"
                cy="24"
                r="22"
                :stroke-dasharray="slideshowRingDasharray"
              />
              <circle
                class="lightbox-control-progress__indicator"
                cx="24"
                cy="24"
                r="22"
                :stroke-dasharray="slideshowRingDasharray"
                :stroke-dashoffset="slideshowRingDashoffset"
              />
            </svg>
          </span>
          <FontAwesomeIcon
            :icon="isSlideshowActive ? faPause : faPlay"
            class="lightbox-control-btn__icon"
          />
        </button>

        <button
          v-if="canUseFullscreen"
          type="button"
          class="lightbox-control-btn"
          :aria-pressed="isFullscreen"
          :aria-label="
            isFullscreen
              ? t('lifestyle.fullscreen.exit')
              : t('lifestyle.fullscreen.enter')
          "
          @click="toggleFullscreen"
        >
          <FontAwesomeIcon
            :icon="
              isFullscreen
                ? faDownLeftAndUpRightToCenter
                : faUpRightAndDownLeftFromCenter
            "
            class="lightbox-control-btn__icon"
          />
          <span class="lightbox-control-btn__label">
            {{
              isFullscreen
                ? t("lifestyle.fullscreen.exit")
                : t("lifestyle.fullscreen.enter")
            }}
          </span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-heading {
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700; /* font-bold */
  line-height: 1.2;
  margin-bottom: 0.75rem; /* mb-3 */
}
.section-sep {
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 1.25rem 0 1.5rem; /* my-5 mb-6 */
}
:global(.dark) .section-sep {
  border-top-color: rgba(255, 255, 255, 0.15);
}
.section-heading {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600; /* font-semibold */
  margin-bottom: 1rem; /* mb-4 */
}
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gallery-tile {
  display: block;
  aspect-ratio: 1 / 1; /* square preview */
  overflow: hidden;
  cursor: pointer; /* indicate clickable */
}

.gallery-tile :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.lightbox-controls {
  position: absolute;
  top: 3.5rem;
  right: 0.5rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: auto;
}

.lightbox-control-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.2s ease;
  position: relative;
}
.lightbox-control-btn:hover,
.lightbox-control-btn:focus-visible {
  color: #ffffff;
}
.lightbox-control-btn:active,
.lightbox-control-btn[aria-pressed="true"] {
  color: rgba(255, 255, 255, 0.9);
}
.lightbox-control-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.65);
  outline-offset: 2px;
}
.lightbox-control-btn__icon {
  font-size: 1.35rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}
.lightbox-control-btn__label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.lightbox-control-progress {
  position: absolute;
  inset: -0.35rem;
  border-radius: 9999px;
  pointer-events: none;
  display: block;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 0;
}
.lightbox-control-btn[aria-pressed="true"] .lightbox-control-progress {
  opacity: 1;
}
.lightbox-control-progress__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.lightbox-control-progress__track,
.lightbox-control-progress__indicator {
  fill: none;
  stroke-width: 2.4;
}
.lightbox-control-progress__track {
  stroke: rgba(255, 255, 255, 0.35);
  stroke-dashoffset: 0;
}
.lightbox-control-progress__indicator {
  stroke: rgba(255, 255, 255, 0.95);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.1s linear;
}

/* Section separators: elegant centered thin line between sections */
.lifestyle-section + .lifestyle-section {
  --section-gap: 3rem; /* vertical space between sections */
  position: relative;
  margin-top: 0; /* we use padding to create the gap so we can center the divider inside it */
  padding-top: var(--section-gap);
}
.lifestyle-section + .lifestyle-section::before {
  content: "";
  position: absolute;
  top: calc(var(--section-gap) / 2);
  left: 50%;
  transform: translateX(-50%);
  width: 120px; /* thin, centered line */
  height: 1px;
  background-color: rgba(0, 0, 0, 0.18);
  border-radius: 1px;
  z-index: 1;
}
:global(.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(
    255,
    255,
    255,
    0.6
  ); /* increased contrast for dark mode */
}
:global(html.dark) .lifestyle-section + .lifestyle-section::before,
:global(body.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(255, 255, 255, 0.75);
}
</style>

<style scoped>
/* Fallback for environments that use system dark mode without adding a .dark class */
@media (prefers-color-scheme: dark) {
  .section-sep {
    border-top-color: rgba(255, 255, 255, 0.15);
  }
  .lifestyle-section + .lifestyle-section::before {
    background-color: rgba(255, 255, 255, 0.75);
  }
}
</style>

<style scoped>
/* Force light theme appearance when the site is in light mode (html:not(.dark))
   This ensures separators stay dark and visible even if the OS prefers dark. */
:global(html:not(.dark)) .section-sep {
  border-top-color: rgba(0, 0, 0, 0.2);
}
:global(html:not(.dark)) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(0, 0, 0, 0.28);
}
</style>

<style scoped>
/* Final pass: ensure separator is clearly visible and centered in all themes */
/* Light theme (explicit) */
:global(html:not(.dark)) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(0, 0, 0, 0.36); /* stronger for light backgrounds */
  height: 2px; /* slightly thicker for retina/hiDPI */
}
/* Dark theme (covers html/body with .dark and global .dark wrappers) */
:global(html.dark) .lifestyle-section + .lifestyle-section::before,
:global(body.dark) .lifestyle-section + .lifestyle-section::before,
:global(.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(255, 255, 255, 0.9); /* high contrast on dark */
  height: 2px; /* keep thickness consistent */
}
</style>

<style>
/* Final global override to ensure light-mode separators are clearly visible
   even if prefers-color-scheme: dark rules or other styles interfere. */
html:not(.dark) .section-sep {
  border-top-color: rgba(
    0,
    0,
    0,
    0.5
  ) !important; /* stronger contrast in light mode */
}
html:not(.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(
    0,
    0,
    0,
    0.65
  ) !important; /* clearly visible on white */
  height: 2px !important; /* retina-friendly thickness */
  width: 140px; /* slightly wider for visibility */
}
</style>

<style scoped>
:global(.vel-img) {
  width: 100vw !important;
  max-width: 100vw !important;
  min-width: 100vw !important;
  height: auto !important;
  max-height: 100vh !important;
  box-shadow: none !important;
  background-color: transparent !important;
  border: none !important;
  filter: none !important;
  object-fit: contain;
}
:global(.vel-img-wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
  width: auto !important;
  max-width: 100vw !important;
}
</style>
