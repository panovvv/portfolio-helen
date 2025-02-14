<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import galleryFiles from "~/assets/gallery_files.json"; // Now an array of objects
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

// Update galleryData to extract filename from each object in galleryFiles.
const galleryData = computed(() => {
  // Dependency on locale
  const _ = locale.value;
  return (galleryFiles as GalleryFile[]).map((fileObj) => {
    const filename = fileObj.filename;
    const meta = (galleryMetadata as GalleryMeta[]).find(
      (item) => item.filename === filename,
    );
    return {
      src: `/gallery/${filename}`,
      thumb: `/gallery/${filename}`, // base URL; you may append query params if needed
      alt: meta?.alt || "gallery.noDescription",
      tags: meta?.tags || [],
      width: fileObj.width,
      height: fileObj.height,
    };
  });
});

const filter = ref("All");

const availableTags = computed(() => {
  const tagSet = new Set<string>();
  galleryData.value.forEach((img) => {
    img.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet);
});

const filteredGallery = computed(() =>
  filter.value === "All"
    ? galleryData.value
    : galleryData.value.filter((img) => img.tags.includes(filter.value)),
);

const galleryContainer = ref<HTMLElement | null>(null);
const galleryInstance = ref<any>(null);

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
      thumbnail: true,
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
    <h1 class="text-2xl font-bold mb-4">{{ t("gallery.title") }}</h1>
    <div class="mb-4 flex flex-wrap gap-2">
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
    </div>
    <!-- Masonry layout using CSS columns -->
    <div :key="locale" ref="galleryContainer" class="masonry">
      <a
        v-for="(img, index) in filteredGallery"
        :key="index"
        :href="img.src"
        class="gallery-item masonry-item"
        :data-thumb="img.thumb + '?w=150&h=100&fit=crop'"
      >
        <!-- NuxtImg uses intrinsic dimensions (if provided) to reserve space -->
        <NuxtImg
          :src="img.src"
          :alt="t(img.alt)"
          :width="img.width"
          :height="img.height"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
@import "lightgallery/css/lightgallery.css";
@import "lightgallery/css/lg-thumbnail.css";
@import "lightgallery/css/lg-zoom.css";
@import "lightgallery/css/lg-autoplay.css";
@import "lightgallery/css/lg-fullscreen.css";

/* Masonry layout using CSS columns */
.masonry {
  column-count: 3;
  column-gap: 1rem;
}
.masonry-item {
  display: block;
  break-inside: avoid;
  margin-bottom: 1rem;
}
</style>
