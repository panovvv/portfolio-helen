<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  type Ref,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "#imports";
import type { GalleryImage, LightboxOptions } from "~~/types/Gallery";
import galleryMetadata from "~/assets/gallery_metadata.json";

const { t, te, locale } = useI18n();

useSeoMeta({
  title: () => t("seo.portfolio.title"),
  ogTitle: () => t("seo.portfolio.title"),
  description: () => t("seo.portfolio.description"),
  ogDescription: () => t("seo.portfolio.description"),
  twitterTitle: () => t("seo.portfolio.title"),
  twitterDescription: () => t("seo.portfolio.description"),
});
const route = useRoute();
const router = useRouter();

interface GalleryMeta {
  filename: string;
  alt?: string;
  tags?: string[];
}

type TaggedGalleryImage = GalleryImage & { tags: string[] };

const TAG_ORDER = [
  "skin_care",
  "makeup",
  "casmara_tonic",
  "casmara_eye",
  "collagen",
  "anti_age",
  "packaging",
  "food",
  "outdoor",
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
    const title = meta?.alt ? t(`${meta.alt}.title`) : undefined;
    const descKey = `${meta.alt}.description`;
    const description = meta?.alt && te(descKey) ? t(descKey) : undefined;
    return {
      href: `/gallery/${filename}`,
      alt: title ?? description,
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

// Scroll-to-top button
const showScrollTop = ref(false);
const lightboxOpen = ref(false);

function updateScrollTop() {
  showScrollTop.value = window.scrollY > 100;
}

function checkLightbox() {
  lightboxOpen.value = !!document.querySelector(".glightbox-open");
}

let lightboxObserver: MutationObserver | null = null;

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Tag scroll indicators
const tagScroller = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const tagScrollerBottom = ref<HTMLElement | null>(null);
const canScrollLeftBottom = ref(false);
const canScrollRightBottom = ref(false);

function updateScrollIndicatorsFor(
  el: HTMLElement | null,
  left: Ref<boolean>,
  right: Ref<boolean>,
) {
  if (!el) return;
  left.value = el.scrollLeft > 0;
  right.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

function updateScrollIndicators() {
  updateScrollIndicatorsFor(tagScroller.value, canScrollLeft, canScrollRight);
  updateScrollIndicatorsFor(
    tagScrollerBottom.value,
    canScrollLeftBottom,
    canScrollRightBottom,
  );
}

// Sync scroll positions between top and bottom tag strips
let scrollSyncSource: HTMLElement | null = null;

function onTagScroll(event: Event) {
  const source = event.currentTarget as HTMLElement;
  if (scrollSyncSource && scrollSyncSource !== source) return;
  scrollSyncSource = source;

  const target =
    source === tagScroller.value ? tagScrollerBottom.value : tagScroller.value;
  if (target && target.scrollLeft !== source.scrollLeft) {
    target.scrollLeft = source.scrollLeft;
  }

  updateScrollIndicators();

  requestAnimationFrame(() => {
    scrollSyncSource = null;
  });
}

onMounted(() => {
  updateScrollIndicators();
  tagScroller.value?.addEventListener("scroll", onTagScroll, {
    passive: true,
  });
  tagScrollerBottom.value?.addEventListener("scroll", onTagScroll, {
    passive: true,
  });
  window.addEventListener("resize", updateScrollIndicators, { passive: true });
  window.addEventListener("scroll", updateScrollTop, { passive: true });
  updateScrollTop();

  lightboxObserver = new MutationObserver(checkLightbox);
  lightboxObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onBeforeUnmount(() => {
  tagScroller.value?.removeEventListener("scroll", onTagScroll);
  tagScrollerBottom.value?.removeEventListener("scroll", onTagScroll);
  window.removeEventListener("resize", updateScrollIndicators);
  window.removeEventListener("scroll", updateScrollTop);
  lightboxObserver?.disconnect();
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
    <div class="relative mb-4">
      <div
        v-if="canScrollLeft"
        class="md:hidden pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent"
      />
      <div
        v-if="canScrollRight"
        class="md:hidden pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent"
      />
      <div
        ref="tagScroller"
        class="flex gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-x-visible"
      >
        <button
          class="shrink-0 px-4 py-4 md:py-2 rounded font-semibold transition-colors duration-200 cursor-pointer"
          :class="
            filter === 'All'
              ? 'bg-primary-600 text-white dark:bg-primary-500'
              : 'border border-primary-400 text-primary-600 dark:border-primary-500 dark:text-primary-300'
          "
          @click="filter = 'All'"
        >
          {{ t("gallery.tags.all") }}
        </button>
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="shrink-0 px-4 py-4 md:py-2 rounded transition-colors duration-200 cursor-pointer"
          :class="
            filter === tag
              ? 'bg-primary-600 text-white dark:bg-primary-500'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          "
          @click="filter = tag"
        >
          {{ t(`gallery.tags.${tag}`) }}
        </button>
      </div>
    </div>

    <div class="gallery-wrapper">
      <Gallery
        :items="filteredGallery"
        :gallery-id="galleryId"
        v-bind="lightboxOptions"
      />
    </div>

    <!-- Bottom tag buttons -->
    <div class="relative mt-8">
      <div
        v-if="canScrollLeftBottom"
        class="md:hidden pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent"
      />
      <div
        v-if="canScrollRightBottom"
        class="md:hidden pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent"
      />
      <div
        ref="tagScrollerBottom"
        class="flex gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-x-visible"
      >
        <button
          class="shrink-0 px-4 py-4 md:py-2 rounded font-semibold transition-colors duration-200 cursor-pointer"
          :class="
            filter === 'All'
              ? 'bg-primary-600 text-white dark:bg-primary-500'
              : 'border border-primary-400 text-primary-600 dark:border-primary-500 dark:text-primary-300'
          "
          @click="
            filter = 'All';
            scrollToTop();
          "
        >
          {{ t("gallery.tags.all") }}
        </button>
        <button
          v-for="tag in availableTags"
          :key="'bottom-' + tag"
          class="shrink-0 px-4 py-4 md:py-2 rounded transition-colors duration-200 cursor-pointer"
          :class="
            filter === tag
              ? 'bg-primary-600 text-white dark:bg-primary-500'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          "
          @click="
            filter = tag;
            scrollToTop();
          "
        >
          {{ t(`gallery.tags.${tag}`) }}
        </button>
      </div>
    </div>

    <!-- Scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop && !lightboxOpen"
        @click="scrollToTop"
        aria-label="Scroll to top"
        class="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary-600/80 text-white hover:bg-primary-600 backdrop-blur-sm transition-all duration-200 cursor-pointer shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.gallery-wrapper {
  margin-top: 1.5rem;
}

:deep(.gallery-tile) {
  aspect-ratio: 2 / 3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
