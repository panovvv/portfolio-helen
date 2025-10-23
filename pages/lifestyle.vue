<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
// Lifestyle page uses images placed under /public/lifestyle-001
// No metadata JSON is used here; we load a predefined list of files from that folder.
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

const { t, locale } = useI18n();

interface GalleryItem {
  src: string;
  thumb: string;
  alt?: string;
}

// List images from /public/lifestyle-001 folder
const lifestyleFiles = [
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

const galleryItems = computed<GalleryItem[]>(() => {
  const _ = locale.value;
  return lifestyleFiles.map((filename) => ({
    src: `/lifestyle-001/${filename}`,
    thumb: `/lifestyle-001/${filename}`,
    alt: undefined,
  }));
});

const filteredGallery = computed<GalleryItem[]>(() => {
  // if (filter.value === "All") {
  const items = galleryItems.value;
  return items.map((item, idx) => ({ item, idx })).map((x) => x.item);
  // }
  // return galleryItems.value.filter((img) => img.tags.includes(filter.value));
});

const galleryContainer = ref<HTMLElement | null>(null);
const galleryInstance = ref<LightGallery | null>(null);

const initializeLightGallery = () => {
  if (galleryContainer.value) {
    if (galleryInstance.value) {
      galleryInstance.value.destroy();
    }
    galleryInstance.value = lightGallery(galleryContainer.value, {
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
  if (galleryInstance.value) {
    galleryInstance.value.destroy();
    galleryInstance.value = null;
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
        {{ t("lifestyle.sections.oceanLove.title") }}
      </h2>
      <div :key="locale" ref="galleryContainer" class="gallery-grid">
        <div
          v-for="(img, index) in filteredGallery"
          :key="index"
          class="gallery-item gallery-tile"
          role="button"
          tabindex="0"
          :aria-label="
            img.alt ? t(img.alt) : t('lifestyle.sections.oceanLove.title')
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
              :placeholder="false"
              @load="loadedMap[img.src] = true"
              @error="loadedMap[img.src] = true"
            />
          </div>
        </div>
      </div>
    </section>
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
</style>
