<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import galleryFiles from "~/assets/gallery_files.json";
import galleryMetadata from "~/assets/gallery_metadata.json";
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

interface GalleryFile {
  filename: string;
  width: number;
  height: number;
}

interface GalleryMeta {
  filename: string;
  alt?: string;
  tags?: string[];
}

interface GalleryItem {
  src: string;
  thumb: string;
  alt?: string;
  tags: string[];
  width: number;
  height: number;
}

const galleryItems = computed<GalleryItem[]>(() => {
  const _ = locale.value;
  return (galleryFiles as GalleryFile[]).map((fileObj) => {
    const filename = fileObj.filename;
    const meta = (galleryMetadata as GalleryMeta[]).find(
      (item) => item.filename === filename,
    );
    return {
      src: `/gallery/${filename}`,
      thumb: `/gallery/${filename}`,
      alt: meta?.alt,
      tags: meta?.tags || [],
      width: fileObj.width,
      height: fileObj.height,
    };
  });
});

type Tag = (typeof TAG_ORDER)[number] | (string & {});

type FilterValue = "All" | Tag;

const filter = ref<FilterValue>("All");

const TAG_ORDER = [
  "brand",
  "cosmetics",
  "food",
  "beverages",
  "collagen",
  "anti_age",
  "creative",
] as const;

const TAG_ORDER_MAP = new Map<string, number>(
  TAG_ORDER.map((t, i) => [t as string, i]),
);

const getTagRank = (tags: string[]): number => {
  let min = Number.POSITIVE_INFINITY;
  for (const tag of tags) {
    const idx = TAG_ORDER_MAP.get(tag);
    if (idx !== undefined && idx < min) min = idx;
  }
  return min;
};

const availableTags = computed<string[]>(() => {
  const tagSet = new Set<string>();
  galleryItems.value.forEach((img) => {
    img.tags.forEach((tag) => tagSet.add(tag));
  });
  const tags = Array.from(tagSet);
  return tags.sort((a, b) => {
    const ai = TAG_ORDER_MAP.has(a)
      ? (TAG_ORDER_MAP.get(a) as number)
      : Number.POSITIVE_INFINITY;
    const bi = TAG_ORDER_MAP.has(b)
      ? (TAG_ORDER_MAP.get(b) as number)
      : Number.POSITIVE_INFINITY;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  });
});

const filteredGallery = computed<GalleryItem[]>(() => {
  if (filter.value === "All") {
    const items = galleryItems.value;
    return items
      .map((item, idx) => ({ item, idx, rank: getTagRank(item.tags) }))
      .sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : a.idx - b.idx))
      .map((x) => x.item);
  }
  return galleryItems.value.filter((img) => img.tags.includes(filter.value));
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
  if (availableTags.value.length > 0) {
    filter.value = availableTags.value[0];
  } else {
    filter.value = "All";
  }
  initializeLightGallery();
});

watch(
  availableTags,
  (newTags) => {
    if (filter.value !== "All" && !newTags.includes(filter.value)) {
      filter.value = newTags[0] ?? "All";
    }
  },
  { flush: "post" },
);

watch(locale, async () => {
  if (galleryInstance.value) {
    galleryInstance.value.destroy();
    galleryInstance.value = null;
  }
  await nextTick();
  initializeLightGallery();
});

watch(filter, async () => {
  if (galleryInstance.value) {
    galleryInstance.value.destroy();
    galleryInstance.value = null;
  }
  await nextTick();
  initializeLightGallery();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="tag in availableTags"
        :key="tag"
        class="px-4 py-2 rounded transition-colors duration-200"
        :class="
          filter === tag
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        @click="filter = tag"
      >
        {{ t(`gallery.tags.${tag}`) }}
      </button>
      <button
        class="px-4 py-2 rounded transition-colors duration-200"
        :class="
          filter === 'All'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        @click="filter = 'All'"
      >
        {{ t("gallery.tags.all") }}
      </button>
    </div>
    <div :key="locale" ref="galleryContainer" class="gallery-grid">
      <a
        v-for="(img, index) in filteredGallery"
        :key="index"
        :href="img.src"
        class="gallery-item gallery-tile"
        :data-thumb="img.thumb + '?w=150&h=100&fit=crop'"
      >
        <NuxtImg
          :src="img.src"
          :alt="img.alt ? t(img.alt) : undefined"
          :width="img.width"
          :height="img.height"
          placeholder
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
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
  aspect-ratio: 2 / 3;
  overflow: hidden;
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
</style>
