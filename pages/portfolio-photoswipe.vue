<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import galleryFilesRaw from "~/assets/gallery_files.json";
import galleryMetadata from "~/assets/gallery_metadata.json";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

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

// Cast the raw manifest to an array of GalleryFile objects.
const galleryFiles = galleryFilesRaw as unknown as GalleryFile[];

const galleryData = computed(() => {
  // Force re-computation on language change.
  const _ = locale.value;
  return galleryFiles.map((fileEntry) => {
    const filename = fileEntry.filename;
    const meta = (galleryMetadata as GalleryMeta[]).find(
      (item) => item.filename === filename,
    );
    return {
      src: `/gallery/${filename}`,
      // Use a cropped thumbnail URL for the thumbnail strip.
      thumb: `/gallery/${filename}?w=150&h=100&fit=crop`,
      alt: meta?.alt || "gallery.noDescription",
      tags: meta?.tags || [],
      // Use the intrinsic dimensions for PhotoSwipe.
      width: fileEntry.width,
      height: fileEntry.height,
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
const lightboxInstance = ref<PhotoSwipeLightbox | null>(null);

const initializePhotoSwipe = () => {
  if (lightboxInstance.value) {
    lightboxInstance.value.destroy();
    lightboxInstance.value = null;
  }
  lightboxInstance.value = new PhotoSwipeLightbox({
    gallery: "#pswp-gallery",
    children: ".gallery-item",
    pswpModule: () => import("photoswipe"),
    zoom: true,
    close: true,
    showHideAnimationType: "zoom",
  });
  lightboxInstance.value.init();
};

onMounted(() => {
  initializePhotoSwipe();
});

watch(locale, async () => {
  if (lightboxInstance.value) {
    lightboxInstance.value.destroy();
    lightboxInstance.value = null;
  }
  await nextTick();
  initializePhotoSwipe();
});

watch(filter, async () => {
  if (lightboxInstance.value) {
    lightboxInstance.value.destroy();
    lightboxInstance.value = null;
  }
  await nextTick();
  initializePhotoSwipe();
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
    <!-- Custom grid layout with explicit, uniform row and column gaps -->
    <div id="pswp-gallery" ref="galleryContainer" class="gallery-grid">
      <a
        v-for="(img, index) in filteredGallery"
        :key="index"
        :href="img.src"
        class="gallery-item"
        :data-pswp-width="img.width"
        :data-pswp-height="img.height"
        :data-thumb="img.thumb"
        :data-pswp-src="img.src"
        :data-cropped="true"
      >
        <NuxtImg :src="img.src" :alt="t(img.alt)" width="400" height="300" />
      </a>
    </div>
  </div>
</template>

<style scoped>
@import "photoswipe/style.css";

/* Custom grid with explicit uniform spacing */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  /* Use explicit row and column gaps */
  row-gap: 1rem !important;
  column-gap: 1rem !important;
}

/* Remove any extra margins/paddings from anchor elements and images */
.gallery-grid a {
  margin: 0 !important;
  padding: 0 !important;
}
.gallery-grid a img {
  margin: 0 !important;
  padding: 0 !important;
  display: block;
  width: 100%;
  height: auto;
}
</style>
