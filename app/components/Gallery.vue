<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import "glightbox/dist/css/glightbox.min.css";
import { useImage } from "#imports";
import type { LightboxOptions, GalleryImage } from "~~/types/Gallery";

type GLightboxInitOptions = LightboxOptions & { elements?: GalleryImage[] };

type GLightboxInstance = {
  destroy: () => void;
  reload?: () => void;
  openAt: (index: number) => void;
  getActiveSlideIndex?: () => number;
  on: (event: string, callback: (data?: any) => void, once?: boolean) => void;
};

type DerivedItem = {
  previewSrc: string;
  lightboxSrc: string;
  alt?: string;
  title?: string;
  description?: string;
  descPosition?: "bottom" | "top" | "left" | "right";
};

const props = withDefaults(
  defineProps<
    {
      items: GalleryImage[];
      galleryId: string;
    } & LightboxOptions
  >(),
  {
    touchNavigation: true,
    loop: false,
    openEffect: "zoom",
    closeEffect: "zoom",
    slideEffect: "slide",
    closeButton: true,
    closeOnOutsideClick: true,
    zoomable: true,
    preload: true,
  },
);

let glightboxInstance: GLightboxInstance | null = null;
let glightboxFactory:
  | ((options?: GLightboxInitOptions) => GLightboxInstance)
  | null = null;
let restoreUrl: string | null = null;

const nuxtImg = useImage();

const derivedItems = computed<DerivedItem[]>(() => {
  return props.items.map((input) => {
    const { title, description, descPosition, alt } = input;
    const lightboxSrc = nuxtImg(input.href, {
      width: 4096,
      quality: 85,
      format: "webp",
    });
    return {
      previewSrc: input.href,
      lightboxSrc,
      alt,
      title,
      description,
      descPosition,
    } as DerivedItem;
  });
});

const gatherOptions = () => ({
  touchNavigation: props.touchNavigation,
  loop: props.loop,
  openEffect: props.openEffect,
  closeEffect: props.closeEffect,
  slideEffect: props.slideEffect,
  closeButton: props.closeButton,
  closeOnOutsideClick: props.closeOnOutsideClick,
  zoomable: props.zoomable,
  preload: props.preload,
});

const HASH_PREFIX = "glb";

function buildHash(galleryId: string, index: number) {
  return `#${HASH_PREFIX}=${encodeURIComponent(galleryId)}:${index}`;
}

function parseHash(hash: string) {
  if (!hash || !hash.startsWith(`#${HASH_PREFIX}=`)) {
    return null;
  }
  const payload = hash.slice(HASH_PREFIX.length + 2);
  const [galleryPart, indexPart] = payload.split(":");
  if (!galleryPart || indexPart === undefined) {
    return null;
  }
  const index = Number.parseInt(indexPart, 10);
  if (Number.isNaN(index)) {
    return null;
  }
  return {
    galleryId: decodeURIComponent(galleryPart),
    index,
  };
}

function clampIndex(index: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  if (index > total - 1) {
    return total - 1;
  }
  return index;
}

function updateLocationHash(index: number) {
  if (typeof window === "undefined") {
    return;
  }
  const base = window.location.pathname + window.location.search;
  const hash = buildHash(props.galleryId, index);
  window.history.replaceState(null, "", `${base}${hash}`);
}

function syncHashWithActive() {
  if (!glightboxInstance) {
    return;
  }
  const activeIdx =
    typeof glightboxInstance.getActiveSlideIndex === "function"
      ? (glightboxInstance.getActiveSlideIndex() ?? 0)
      : 0;
  const index = clampIndex(activeIdx, props.items.length);
  updateLocationHash(index);
}

async function loadGlightbox(): Promise<
  (options?: GLightboxInitOptions) => GLightboxInstance
> {
  if (glightboxFactory) {
    return glightboxFactory;
  }
  const mod = await import("glightbox");
  const factory = (mod as any)?.default || (mod as any);
  if (typeof factory !== "function") {
    throw new Error("Unable to load glightbox factory");
  }
  glightboxFactory = factory;
  return factory;
}

async function initLightbox() {
  if (typeof window === "undefined") {
    return;
  }
  const GLightbox = await loadGlightbox();
  await nextTick();
  glightboxInstance?.destroy();
  glightboxInstance = GLightbox({
    ...gatherOptions(),
    elements: derivedItems.value.map((item) => {
      // Only include defined fields to avoid "undefined" showing in captions
      const el: any = {
        href: item.lightboxSrc,
        type: "image",
      };
      if (item.title !== undefined) el.title = item.title;
      if (item.description !== undefined) el.description = item.description;
      if (item.descPosition !== undefined) el.descPosition = item.descPosition;
      return el as GalleryImage;
    }),
  });

  if (glightboxInstance?.on) {
    glightboxInstance.on("open", () => {
      const base = window.location.pathname + window.location.search;
      const parsed = parseHash(window.location.hash);
      restoreUrl =
        parsed && parsed.galleryId === props.galleryId
          ? base
          : base + window.location.hash;
      syncHashWithActive();
    });

    glightboxInstance.on("slide_changed", ({ current }: any = {}) => {
      if (!current) {
        return;
      }
      const index = clampIndex(
        typeof current.slideIndex === "number" ? current.slideIndex : 0,
        props.items.length,
      );
      updateLocationHash(index);
    });

    glightboxInstance.on("close", () => {
      const base = window.location.pathname + window.location.search;
      const target = restoreUrl ?? base;
      window.history.replaceState(null, "", target);
      restoreUrl = null;
    });
  }

  const parsed = parseHash(window.location.hash);
  if (parsed && parsed.galleryId === props.galleryId) {
    const index = clampIndex(parsed.index, props.items.length);
    glightboxInstance.openAt(index);
  }
}

onMounted(() => {
  initLightbox();
});

function itemsWatchKey(items: GalleryImage[]) {
  return items
    .map((it) =>
      [it.href, it.title, it.description, it.descPosition, it.alt]
        .filter((x) => x !== undefined && x !== null)
        .join("|"),
    )
    .join("||");
}

watch(
  () => [
    itemsWatchKey(props.items),
    props.galleryId,
    props.touchNavigation,
    props.loop,
    props.openEffect,
    props.closeEffect,
    props.slideEffect,
    props.closeButton,
    props.closeOnOutsideClick,
    props.zoomable,
    props.preload,
  ],
  () => {
    initLightbox();
  },
);

onBeforeUnmount(() => {
  glightboxInstance?.destroy();
  glightboxInstance = null;
  if (typeof window !== "undefined" && restoreUrl) {
    const target = restoreUrl;
    restoreUrl = null;
    window.history.replaceState(null, "", target);
  }
});

function openSlide(index: number) {
  if (!glightboxInstance) return;
  const safeIndex = clampIndex(index, props.items.length);
  glightboxInstance.openAt(safeIndex);
}
</script>

<template>
  <div class="gallery-grid">
    <button
      v-for="(img, index) in derivedItems"
      :key="`${props.galleryId}-${index}`"
      class="gallery-tile"
      type="button"
      :aria-label="img.alt ?? ''"
      @click="openSlide(index)"
    >
      <NuxtImg
        :src="img.previewSrc"
        :alt="img.alt ?? ''"
        sizes="160px xs:320px"
        densities="x1 x2"
        loading="lazy"
        placeholder
        quality="80"
        format="webp"
      />
    </button>
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
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0;
  width: 100%;
  text-align: inherit;
}

.gallery-tile :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

:global(.glightbox-container .gslide-description) {
  padding: 1.25rem !important;
}

:global(.dark .glightbox-container .gslide-description),
:global(.dark .glightbox-container .gslide-description *) {
  background-color: rgba(15, 23, 42, 0.92) !important;
  color: #f8fafc !important;
  border-top: 1px solid rgba(248, 250, 252, 0.12);
}
</style>
