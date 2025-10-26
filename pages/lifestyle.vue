<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import lightGallery from "lightgallery";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgAutoplay from "lightgallery/plugins/autoplay";
import lgFullscreen from "lightgallery/plugins/fullscreen";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-autoplay.css";
import "lightgallery/css/lg-fullscreen.css";

import type { LightGallery } from "lightgallery/lightgallery";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const { t, locale } = useI18n();

interface GalleryItem {
  src: string;
  thumb: string;
  alt?: string;
}

// List images from /public/lifestyle-001 folder
const lifestyle001Files = [
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
];

// List images from /public/lifestyle-002 folder
const lifestyle002Files = [
  "_DSC1869 copy.jpg",
  "_DSC1878 copy (2) 1.jpg",
  "_DSC1895 copy.jpg",
  "_DSC1902 copy1.jpg",
];

// List images from /public/lifestyle-003 folder
const lifestyle003Files = [
  "1_DSC3233.jpg",
  "2_DSC3452.jpg",
  "3_DSC3291.jpg",
  "4_DSC3476-1.jpg",
];

// List images from /public/lifestyle-004 folder
const lifestyle004Files = [
  "1_DSC4591 copy.jpg",
  "2_DSC4433 copy.jpg",
  "3_DSC4599 copy.jpg",
  "4_DSC4638 copy.jpg",
];

const galleryItems001 = computed<GalleryItem[]>(() => {
  const _ = locale.value;
  return lifestyle001Files.map((filename) => ({
    src: `/lifestyle-001/${filename}`,
    thumb: `/lifestyle-001/${filename}`,
    alt: undefined,
  }));
});

const galleryItems002 = computed<GalleryItem[]>(() => {
  const _ = locale.value;
  return lifestyle002Files.map((filename) => ({
    src: `/lifestyle-002/${filename}`,
    thumb: `/lifestyle-002/${filename}`,
    alt: undefined,
  }));
});

const galleryItems003 = computed<GalleryItem[]>(() => {
  const _ = locale.value;
  return lifestyle003Files.map((filename) => ({
    src: `/lifestyle-003/${filename}`,
    thumb: `/lifestyle-003/${filename}`,
    alt: undefined,
  }));
});

const galleryItems004 = computed<GalleryItem[]>(() => {
  const _ = locale.value;
  return lifestyle004Files.map((filename) => ({
    src: `/lifestyle-004/${filename}`,
    thumb: `/lifestyle-004/${filename}`,
    alt: undefined,
  }));
});

const galleryContainer001 = ref<HTMLElement | null>(null);
const galleryInstance001 = ref<LightGallery | null>(null);
const galleryContainer002 = ref<HTMLElement | null>(null);
const galleryInstance002 = ref<LightGallery | null>(null);
const galleryContainer003 = ref<HTMLElement | null>(null);
const galleryInstance003 = ref<LightGallery | null>(null);
const galleryContainer004 = ref<HTMLElement | null>(null);
const galleryInstance004 = ref<LightGallery | null>(null);

const initializeLightGallery = () => {
  if (galleryContainer001.value) {
    if (galleryInstance001.value) {
      galleryInstance001.value.destroy();
    }
    galleryInstance001.value = lightGallery(galleryContainer001.value, {
      selector: ".gallery-item",
      speed: 300,
      mode: "lg-slide",
      download: false,
      plugins: [lgThumbnail, lgZoom, lgAutoplay, lgFullscreen],
      thumbnail: false,
      autoplay: true,
      autoplayControls: true,
    });
  }
  if (galleryContainer002.value) {
    if (galleryInstance002.value) {
      galleryInstance002.value.destroy();
    }
    galleryInstance002.value = lightGallery(galleryContainer002.value, {
      selector: ".gallery-item",
      speed: 300,
      mode: "lg-slide",
      download: false,
      plugins: [lgThumbnail, lgZoom, lgAutoplay, lgFullscreen],
      thumbnail: false,
      autoplay: true,
      autoplayControls: true,
    });
  }
  if (galleryContainer003.value) {
    if (galleryInstance003.value) {
      galleryInstance003.value.destroy();
    }
    galleryInstance003.value = lightGallery(galleryContainer003.value, {
      selector: ".gallery-item",
      speed: 300,
      mode: "lg-slide",
      download: false,
      plugins: [lgThumbnail, lgZoom, lgAutoplay, lgFullscreen],
      thumbnail: false,
      autoplay: true,
      autoplayControls: true,
    });
  }
  if (galleryContainer004.value) {
    if (galleryInstance004.value) {
      galleryInstance004.value.destroy();
    }
    galleryInstance004.value = lightGallery(galleryContainer004.value, {
      selector: ".gallery-item",
      speed: 300,
      mode: "lg-slide",
      download: false,
      plugins: [lgThumbnail, lgZoom, lgAutoplay, lgFullscreen],
      thumbnail: false,
      autoplay: true,
      autoplayControls: true,
    });
  }
};

onMounted(() => {
  initializeLightGallery();
});

watch(locale, async () => {
  if (galleryInstance001.value) {
    galleryInstance001.value.destroy();
    galleryInstance001.value = null;
  }
  if (galleryInstance002.value) {
    galleryInstance002.value.destroy();
    galleryInstance002.value = null;
  }
  if (galleryInstance003.value) {
    galleryInstance003.value.destroy();
    galleryInstance003.value = null;
  }
  if (galleryInstance004.value) {
    galleryInstance004.value.destroy();
    galleryInstance004.value = null;
  }
  await nextTick();
  initializeLightGallery();
});

// Track loaded state for thumbnails to show a lightweight spinner until ready
const loadedMap = reactive<Record<string, boolean>>({});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="page-heading">{{ t("lifestyle.title") }}</h1>
    <hr class="section-sep" />

    <section class="lifestyle-section">
      <h2 class="section-heading">
        {{ t("lifestyle.sections.lifestyle-001.title") }}
      </h2>
      <div
        :key="locale + '-001'"
        ref="galleryContainer001"
        class="gallery-grid"
      >
        <div
          v-for="(img, index) in galleryItems001"
          :key="index"
          class="gallery-item gallery-tile"
          role="button"
          tabindex="0"
          :aria-label="
            img.alt ? t(img.alt) : t('lifestyle.sections.lifestyle-001.title')
          "
          :data-src="img.src"
          :data-thumb="img.thumb + '?w=150&h=150&fit=crop'"
        >
          <div class="thumb-wrapper">
            <div
              v-if="!loadedMap[img.src]"
              class="spinner-overlay"
              aria-hidden="true"
            >
              <span class="spinner"></span>
            </div>
            <NuxtImg
              :src="img.src"
              :alt="img.alt ? t(img.alt) : ''"
              sizes="160px xs:320px lg:640px"
              loading="lazy"
              :placeholder="false"
              @load="loadedMap[img.src] = true"
              @error="loadedMap[img.src] = true"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="lifestyle-section">
      <h2 class="section-heading">
        {{ t("lifestyle.sections.lifestyle-002.title") }}
      </h2>
      <div
        :key="locale + '-002'"
        ref="galleryContainer002"
        class="gallery-grid"
      >
        <div
          v-for="(img, index) in galleryItems002"
          :key="index"
          class="gallery-item gallery-tile"
          role="button"
          tabindex="0"
          :aria-label="
            img.alt ? t(img.alt) : t('lifestyle.sections.lifestyle-002.title')
          "
          :data-src="img.src"
          :data-thumb="img.thumb + '?w=150&h=150&fit=crop'"
        >
          <div class="thumb-wrapper">
            <div
              v-if="!loadedMap[img.src]"
              class="spinner-overlay"
              aria-hidden="true"
            >
              <span class="spinner"></span>
            </div>
            <NuxtImg
              :src="img.src"
              :alt="img.alt ? t(img.alt) : ''"
              sizes="160px xs:320px lg:640px"
              loading="lazy"
              :placeholder="false"
              @load="loadedMap[img.src] = true"
              @error="loadedMap[img.src] = true"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="lifestyle-section">
      <h2 class="section-heading">
        {{ t("lifestyle.sections.lifestyle-003.title") }}
      </h2>
      <div
        :key="locale + '-003'"
        ref="galleryContainer003"
        class="gallery-grid"
      >
        <div
          v-for="(img, index) in galleryItems003"
          :key="index"
          class="gallery-item gallery-tile"
          role="button"
          tabindex="0"
          :aria-label="
            img.alt ? t(img.alt) : t('lifestyle.sections.lifestyle-003.title')
          "
          :data-src="img.src"
          :data-thumb="img.thumb + '?w=150&h=150&fit=crop'"
        >
          <div class="thumb-wrapper">
            <div
              v-if="!loadedMap[img.src]"
              class="spinner-overlay"
              aria-hidden="true"
            >
              <span class="spinner"></span>
            </div>
            <NuxtImg
              :src="img.src"
              :alt="img.alt ? t(img.alt) : ''"
              sizes="160px xs:320px lg:640px"
              loading="lazy"
              :placeholder="false"
              @load="loadedMap[img.src] = true"
              @error="loadedMap[img.src] = true"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="lifestyle-section">
      <h2 class="section-heading">
        {{ t("lifestyle.sections.lifestyle-004.title") }}
      </h2>
      <div
        :key="locale + '-004'"
        ref="galleryContainer004"
        class="gallery-grid"
      >
        <div
          v-for="(img, index) in galleryItems004"
          :key="index"
          class="gallery-item gallery-tile"
          role="button"
          tabindex="0"
          :aria-label="
            img.alt ? t(img.alt) : t('lifestyle.sections.lifestyle-004.title')
          "
          :data-src="img.src"
          :data-thumb="img.thumb + '?w=150&h=150&fit=crop'"
        >
          <div class="thumb-wrapper">
            <div
              v-if="!loadedMap[img.src]"
              class="spinner-overlay"
              aria-hidden="true"
            >
              <span class="spinner"></span>
            </div>
            <NuxtImg
              :src="img.src"
              :alt="img.alt ? t(img.alt) : ''"
              sizes="160px xs:320px lg:640px"
              loading="lazy"
              :placeholder="false"
              @load="loadedMap[img.src] = true"
              @error="loadedMap[img.src] = true"
            />
          </div>
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
:global(html:not(.dark) .lg-backdrop) {
  background-color: #ffffff !important;
}
:global(.dark .lg-backdrop) {
  background-color: #000000 !important;
}

/* Light mode: buttons should blend with the white background */
:global(html:not(.dark) .lg-next),
:global(html:not(.dark) .lg-prev),
:global(html:not(.dark) .lg-toolbar .lg-icon) {
  background-color: #ffffff !important; /* match backdrop */
  color: #111111 !important; /* dark icons for contrast */
  box-shadow: none !important;
  border: none !important;
}

:global(html:not(.dark) .lg-next:hover),
:global(html:not(.dark) .lg-prev:hover),
:global(html:not(.dark) .lg-toolbar .lg-icon:hover) {
  background-color: #ffffff !important; /* keep same color on hover */
  color: #000000 !important; /* slightly darker on hover */
}

/* Light mode: ensure caption/alt text is visible */
:global(html:not(.dark) .lg-sub-html) {
  color: #111111 !important;
}

/* Thumbnail spinner */
.thumb-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.spinner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2; /* ensure spinner is above the image */
}
.spinner {
  position: relative;
  display: inline-block;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  border: 3px solid var(--portfolio-spinner-track);
  border-top-color: var(--portfolio-spinner-leading);
  background: var(--portfolio-spinner-bg);
  animation: spin 0.75s linear infinite;
  box-shadow: var(--portfolio-spinner-shadow);
}
.spinner::before {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: inherit;
  border: 2px solid transparent;
  border-top-color: var(--portfolio-spinner-leading);
  opacity: 0.85;
  animation: spin 1.15s linear infinite;
}
:global(:root) {
  --portfolio-spinner-track: rgba(37, 99, 235, 0.28);
  --portfolio-spinner-leading: #2563eb;
  --portfolio-spinner-bg: radial-gradient(
    circle at center,
    rgba(37, 99, 235, 0.18) 0%,
    rgba(37, 99, 235, 0) 68%
  );
  --portfolio-spinner-shadow:
    0 0 0 3px rgba(37, 99, 235, 0.18), 0 8px 18px -8px rgba(37, 99, 235, 0.6);
}
:global(html.dark),
:global(body.dark) {
  --portfolio-spinner-track: rgba(250, 204, 21, 0.5);
  --portfolio-spinner-leading: #facc15;
  --portfolio-spinner-bg: radial-gradient(
    circle at center,
    rgba(250, 204, 21, 0.32) 0%,
    rgba(250, 204, 21, 0) 72%
  );
  --portfolio-spinner-shadow:
    0 0 0 3px rgba(250, 204, 21, 0.32), 0 0 22px rgba(250, 204, 21, 0.45);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
