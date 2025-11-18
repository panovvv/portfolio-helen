<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "#imports";
import type { GalleryImage, LightboxOptions } from "~~/types/Gallery";
import galleryMetadata from "~/assets/gallery_metadata.json";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

interface GalleryMeta {
  filename: string;
  alt?: string;
  tags?: string[];
}

type TaggedGalleryImage = GalleryImage & { tags: string[] };

const TAG_ORDER = [
  "brand",
  "cosmetics",
  "food",
  "beverages",
  "collagen",
  "anti_age",
  "creative",
] as const;

type Tag = (typeof TAG_ORDER)[number] | (string & {});
type FilterValue = "All" | Tag;

const TAG_ORDER_MAP = new Map<string, number>(
  TAG_ORDER.map((tag, index) => [tag as string, index]),
);
const galleryEntries = galleryMetadata as GalleryMeta[];

const filter = ref<FilterValue>("All");
const routeFilter = computed<FilterValue | undefined>(() => {
  const raw = route.query.tag;
  if (typeof raw !== "string") {
    return undefined;
  }
  if (raw.toLowerCase() === "all") {
    return "All";
  }
  return raw as FilterValue;
});

const getTagRank = (tags: string[]): number => {
  let min = Number.POSITIVE_INFINITY;
  for (const tag of tags) {
    const idx = TAG_ORDER_MAP.get(tag);
    if (idx !== undefined && idx < min) min = idx;
  }
  return min;
};

const galleryItems = computed<TaggedGalleryImage[]>(() => {
  const _ = locale.value;
  return galleryEntries.map((meta) => {
    const filename = meta.filename;
    // Map structured i18n alt fields to title/description
    const title = meta?.alt ? t(`${meta.alt}.title`) : undefined;
    const description = meta?.alt ? t(`${meta.alt}.description`) : undefined;
    return {
      href: `/gallery/${filename}`,
      // Prefer a descriptive alt; fallback to title if no description is provided
      alt: description ?? title,
      title,
      description,
      descPosition: "bottom",
      tags: meta?.tags ?? [],
    };
  });
});

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

const matchTagFromRoute = (tags: string[], candidate: string) => {
  const normalized = candidate.toLowerCase();
  return tags.find((tag) => tag.toLowerCase() === normalized);
};

const applyFilterValue = (value: FilterValue) => {
  if (filter.value !== value) {
    filter.value = value;
  }
};

watch(
  [availableTags, routeFilter],
  ([tags, desired]) => {
    if (tags.length === 0) {
      applyFilterValue("All");
      return;
    }

    if (desired === "All") {
      applyFilterValue("All");
      return;
    }

    if (desired && desired !== "All") {
      const matched = matchTagFromRoute(tags, desired);
      if (matched) {
        applyFilterValue(matched as Tag);
        return;
      }
    }

    if (filter.value !== "All" && tags.includes(filter.value)) {
      return;
    }

    applyFilterValue(tags[0] as Tag);
  },
  { immediate: true },
);

watch(
  filter,
  (value) => {
    if (!process.client) {
      return;
    }
    const normalized = value === "All" ? "all" : value;
    const current =
      typeof route.query.tag === "string" ? route.query.tag : undefined;
    if (current === normalized) {
      return;
    }
    const nextQuery = { ...route.query };
    nextQuery.tag = normalized;
    router.replace({ query: nextQuery });
  },
  { immediate: true },
);

const galleryId = computed(() =>
  filter.value === "All"
    ? "portfolio-gallery"
    : `portfolio-gallery-${filter.value}`,
);

const toGalleryImage = (item: TaggedGalleryImage): GalleryImage => {
  const { tags, ...rest } = item;
  return rest;
};

const filteredGallery = computed<GalleryImage[]>(() => {
  const activeFilter = filter.value;
  if (activeFilter === "All") {
    return galleryItems.value
      .map((item, idx) => ({ item, idx, rank: getTagRank(item.tags) }))
      .sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : a.idx - b.idx))
      .map(({ item }) => toGalleryImage(item));
  }
  return galleryItems.value
    .filter((img) => img.tags.includes(activeFilter))
    .map(toGalleryImage);
});

const lightboxOptions: LightboxOptions = {
  touchNavigation: true,
  loop: true,
  openEffect: "zoom",
  closeEffect: "zoom",
  slideEffect: "slide",
  closeButton: true,
  closeOnOutsideClick: true,
  zoomable: true,
  preload: true,
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="tag in availableTags"
        :key="tag"
        class="px-4 py-2 rounded transition-colors duration-200 cursor-pointer"
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
        class="px-4 py-2 rounded transition-colors duration-200 cursor-pointer"
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

    <div class="gallery-wrapper">
      <Gallery
        :items="filteredGallery"
        :gallery-id="galleryId"
        v-bind="lightboxOptions"
      />
    </div>
  </div>
</template>

<style scoped>
.gallery-wrapper {
  margin-top: 1.5rem;
}

:deep(.gallery-tile) {
  aspect-ratio: 2 / 3;
}
</style>
