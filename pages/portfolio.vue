<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import galleryFilesRaw from "~/assets/gallery_files.json";
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

const galleryFiles = galleryFilesRaw as unknown as GalleryFile[];

const galleryData = computed(() => {
  const _ = locale.value;
  return galleryFiles.map((fileEntry) => {
    const filename = fileEntry.filename;
    const meta = (galleryMetadata as GalleryMeta[]).find(
      (item) => item.filename === filename,
    );
    return {
      src: `/gallery/${filename}`,
      thumb: `/gallery/${filename}?w=150&h=100&fit=crop`,
      alt: meta?.alt || "gallery.noDescription",
      tags: meta?.tags || [],
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
    <!-- Flex layout for gallery images with uniform spacing -->
    <div ref="galleryContainer" class="flex flex-wrap -mx-2">
      <div
        v-for="(img, index) in filteredGallery"
        :key="index"
        class="w-full sm:w-1/2 md:w-1/3 px-2 mb-4"
      >
        <a :href="img.src" class="block gallery-item" :data-thumb="img.thumb">
          <NuxtImg
            :src="img.src"
            :alt="t(img.alt)"
            width="400"
            height="300"
            class="w-full"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "lightgallery/css/lightgallery.css";
@import "lightgallery/css/lg-thumbnail.css";
@import "lightgallery/css/lg-zoom.css";
@import "lightgallery/css/lg-autoplay.css";
@import "lightgallery/css/lg-fullscreen.css";
</style>
