<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import "glightbox/dist/css/glightbox.min.css";
import { useI18n } from "vue-i18n";
import { useImage } from "#imports";
import type { LightboxOptions, GalleryImage } from "~~/types/Gallery";

type GLightboxInitOptions = LightboxOptions & { elements?: GalleryImage[] };

type GLightboxInstance = {
  destroy: () => void;
  reload?: () => void;
  openAt: (index: number) => void;
  getActiveSlideIndex?: () => number;
  preloadSlide?: (index: number) => void;
  on: (event: string, callback: (data?: any) => void, once?: boolean) => void;
  elements?: any[];
  activeSlide?: HTMLElement | null;
  index?: number;
  slidesContainer?: HTMLElement | null;
};

type DerivedItem = {
  previewSrc: string;
  lightboxSrc: string;
  alt?: string;
  title?: string;
  description?: string;
  descPosition?: "bottom" | "top" | "left" | "right";
};

const { t } = useI18n();

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
    preloadForward: 2,
    preloadBackward: 2,
  },
);

let glightboxInstance: GLightboxInstance | null = null;
let glightboxFactory:
  | ((options?: GLightboxInitOptions) => GLightboxInstance)
  | null = null;
let restoreUrl: string | null = null;

const manualPreloadedIndices = new Set<number>();
const manualPreloadedImages = new Map<number, HTMLImageElement>();
let canPreloadWindow = false;
const collapseEventHandlers: Array<{ type: string; handler: EventListener }> =
  [];

function resetPreloadState() {
  manualPreloadedIndices.clear();
  manualPreloadedImages.clear();
  canPreloadWindow = false;
}

function markSlideAsLoaded(index: number | null | undefined) {
  if (typeof index !== "number" || Number.isNaN(index)) {
    return;
  }
  manualPreloadedIndices.add(index);
}

function normalizePreloadCount(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return 0;
  }
  return Math.floor(value);
}

const DEFAULT_PRELOAD_FORWARD = 2;
const DEFAULT_PRELOAD_BACKWARD = 2;

const resolvedPreloadForward = computed(() => {
  const raw =
    typeof props.preloadForward === "number"
      ? props.preloadForward
      : Number(props.preloadForward);
  if (Number.isFinite(raw) && raw !== undefined) {
    return normalizePreloadCount(raw);
  }
  return DEFAULT_PRELOAD_FORWARD;
});

const resolvedPreloadBackward = computed(() => {
  const raw =
    typeof props.preloadBackward === "number"
      ? props.preloadBackward
      : Number(props.preloadBackward);
  if (Number.isFinite(raw) && raw !== undefined) {
    return normalizePreloadCount(raw);
  }
  return DEFAULT_PRELOAD_BACKWARD;
});

function resolveLoopedIndex(index: number, total: number): number | null {
  if (total <= 0) {
    return null;
  }
  if (props.loop) {
    const normalized = index % total;
    return normalized >= 0 ? normalized : normalized + total;
  }
  if (index < 0 || index >= total) {
    return null;
  }
  return index;
}

function resetExpandedDescriptionState() {
  if (typeof document === "undefined") {
    return;
  }
  const body = document.body;
  body.classList.remove("gdesc-open");
  body.classList.remove("gdesc-closed");
}

function restoreSlideDescriptionFromEvent(slideData: any) {
  if (
    !glightboxInstance ||
    !slideData ||
    !slideData.slideNode ||
    !slideData.slideConfig?.smallDescription
  ) {
    return;
  }
  if (props.items.length === 0) {
    return;
  }
  const descEl = slideData.slideNode.querySelector(
    ".gslide-desc",
  ) as HTMLElement | null;
  if (!descEl) {
    return;
  }
  descEl.innerHTML = slideData.slideConfig.smallDescription;
  const elements = (glightboxInstance as any)?.elements;
  const index =
    typeof slideData.index === "number"
      ? clampIndex(slideData.index, props.items.length)
      : null;
  const slideEntry =
    index !== null && elements && elements[index] ? elements[index] : null;
  const slideInstance = slideEntry?.instance;
  if (slideInstance && typeof slideInstance.descriptionEvents === "function") {
    slideInstance.descriptionEvents(descEl, slideData.slideConfig);
  }
}

function restoreActiveSlideDescription() {
  if (!glightboxInstance || props.items.length === 0) {
    return;
  }
  const instanceAny = glightboxInstance as any;
  const elements = instanceAny?.elements;
  if (!elements || elements.length === 0) {
    return;
  }
  const rawIndex =
    typeof glightboxInstance.getActiveSlideIndex === "function"
      ? glightboxInstance.getActiveSlideIndex()
      : instanceAny?.index;
  if (typeof rawIndex !== "number") {
    return;
  }
  const index = clampIndex(rawIndex, props.items.length);
  const slideList = instanceAny?.slidesContainer?.querySelectorAll?.(".gslide");
  const slideNode =
    (slideList ? (slideList[index] as HTMLElement | undefined | null) : null) ??
    instanceAny?.activeSlide ??
    null;
  if (!slideNode) {
    return;
  }
  restoreSlideDescriptionFromEvent({
    slideNode,
    slideConfig: elements[index]?.slideConfig,
    index,
  });
}

function requestPreload(index: number) {
  if (!props.preload || !canPreloadWindow) {
    return;
  }
  if (manualPreloadedIndices.has(index)) {
    return;
  }
  const target = derivedItems.value[index];
  if (!target) {
    return;
  }
  manualPreloadedIndices.add(index);
  if (
    glightboxInstance &&
    typeof glightboxInstance.preloadSlide === "function"
  ) {
    try {
      glightboxInstance.preloadSlide(index);
    } catch {
      // ignore GLightbox preload failures; fallback below still runs
    }
  }
  // Fallback: issue a manual request to guarantee the asset is cached
  if (typeof window !== "undefined") {
    const img = new Image();
    img.decoding = "async";
    img.src = target.lightboxSrc;
    manualPreloadedImages.set(index, img);
  }
}

function collapseExpandedDescription() {
  if (typeof document === "undefined") {
    return;
  }
  const body = document.body;
  if (!body.classList.contains("gdesc-open")) {
    return;
  }
  restoreActiveSlideDescription();
  body.classList.remove("gdesc-open");
  body.classList.add("gdesc-closed");
  const clearClosed = () => {
    document.body.classList.remove("gdesc-closed");
  };
  if (typeof window !== "undefined") {
    window.setTimeout(clearClosed, 400);
  } else {
    clearClosed();
  }
}

function handleGlobalDescriptionPointer(event: Event) {
  if (typeof document === "undefined") {
    return;
  }
  const body = document.body;
  if (!body.classList.contains("gdesc-open")) {
    return;
  }
  const container = document.querySelector(".glightbox-container");
  if (!container || container.classList.contains("inactive")) {
    return;
  }
  const target = event.target as HTMLElement | null;
  if (target?.nodeName?.toLowerCase() === "a") {
    return;
  }
  collapseExpandedDescription();
}

function registerDescriptionCollapseListeners() {
  if (typeof document === "undefined") {
    return;
  }
  const handler = (event: Event) => {
    handleGlobalDescriptionPointer(event);
  };
  const types: Array<keyof DocumentEventMap> = ["pointerup", "click"];
  types.forEach((type) => {
    document.addEventListener(type, handler, true);
    collapseEventHandlers.push({ type, handler });
  });
}

function removeDescriptionCollapseListeners() {
  if (typeof document === "undefined") {
    return;
  }
  collapseEventHandlers.splice(0).forEach(({ type, handler }) => {
    document.removeEventListener(type, handler, true);
  });
}

// Preload the active slide plus a configurable window in front/back directions.
function schedulePreloadAround(index: number) {
  if (!props.preload || !canPreloadWindow) {
    return;
  }
  const total = derivedItems.value.length;
  if (total === 0) {
    return;
  }
  const resolved = resolveLoopedIndex(index, total);
  if (resolved === null) {
    return;
  }

  const forward = resolvedPreloadForward.value;
  const backward = resolvedPreloadBackward.value;

  for (let step = 1; step <= forward; step++) {
    const next = resolveLoopedIndex(resolved + step, total);
    if (next === null) {
      break;
    }
    requestPreload(next);
  }

  for (let step = 1; step <= backward; step++) {
    const prev = resolveLoopedIndex(resolved - step, total);
    if (prev === null) {
      break;
    }
    requestPreload(prev);
  }
}

const nuxtImg = useImage();
const seeMoreLabel = computed(() => t("gallery.lightbox.seeMore"));

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
  // Disable GLightbox's built-in neighbor preload so we can control counts ourselves
  preload: false,
  moreText: seeMoreLabel.value,
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

function syncHashWithActive(): number | null {
  if (!glightboxInstance) {
    return null;
  }
  const activeIdx =
    typeof glightboxInstance.getActiveSlideIndex === "function"
      ? (glightboxInstance.getActiveSlideIndex() ?? 0)
      : 0;
  const index = clampIndex(activeIdx, props.items.length);
  updateLocationHash(index);
  return index;
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
  collapseExpandedDescription();
  glightboxInstance?.destroy();
  glightboxInstance = null;
  resetExpandedDescriptionState();
  resetPreloadState();
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
      const index = syncHashWithActive();
      if (typeof index === "number") {
        schedulePreloadAround(index);
      }
    });

    glightboxInstance.on("slide_changed", ({ current, prev }: any = {}) => {
      if (prev) {
        restoreSlideDescriptionFromEvent(prev);
      }
      resetExpandedDescriptionState();
      if (!current) {
        return;
      }
      const index = clampIndex(
        typeof current.slideIndex === "number" ? current.slideIndex : 0,
        props.items.length,
      );
      updateLocationHash(index);
      schedulePreloadAround(index);
    });

    glightboxInstance.on("close", () => {
      collapseExpandedDescription();
      resetExpandedDescriptionState();
      const base = window.location.pathname + window.location.search;
      const target = restoreUrl ?? base;
      window.history.replaceState(null, "", target);
      restoreUrl = null;
      resetPreloadState();
    });
    glightboxInstance.on(
      "slide_after_load",
      ({ index, slideIndex }: any = {}) => {
        if (!props.preload) {
          return;
        }
        const total = props.items.length;
        const resolvedIndex = clampIndex(
          typeof slideIndex === "number"
            ? slideIndex
            : typeof index === "number"
              ? index
              : 0,
          total,
        );
        markSlideAsLoaded(resolvedIndex);
        const activeIndex = clampIndex(
          typeof glightboxInstance?.getActiveSlideIndex === "function"
            ? (glightboxInstance.getActiveSlideIndex() ?? 0)
            : 0,
          total,
        );
        const isActiveSlide = resolvedIndex === activeIndex;
        if (isActiveSlide && !canPreloadWindow) {
          canPreloadWindow = true;
        }
        if (isActiveSlide) {
          schedulePreloadAround(resolvedIndex);
        }
      },
    );
  }

  const parsed = parseHash(window.location.hash);
  if (parsed && parsed.galleryId === props.galleryId) {
    const index = clampIndex(parsed.index, props.items.length);
    glightboxInstance.openAt(index);
  }
}

onMounted(() => {
  registerDescriptionCollapseListeners();
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
    props.preloadForward,
    props.preloadBackward,
    seeMoreLabel.value,
  ],
  () => {
    initLightbox();
  },
);

onBeforeUnmount(() => {
  collapseExpandedDescription();
  removeDescriptionCollapseListeners();
  glightboxInstance?.destroy();
  glightboxInstance = null;
  resetExpandedDescriptionState();
  resetPreloadState();
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

/* Compact the GLightbox caption wrapper */
:global(.glightbox-container .gslide) {
  width: 100% !important;
}

:global(.glightbox-container .gslide-inner-content) {
  width: 100% !important;
  flex: 1 1 auto !important;
}

:global(.glightbox-container .ginner-container) {
  width: 100% !important;
  flex: 1 1 auto !important;
  max-width: 100vw !important;
  align-items: stretch !important;
}

:global(.glightbox-container .gslide-description) {
  margin: 0 auto !important;
  padding: 0 !important;
  padding-bottom: 0.75rem !important;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px)) !important;
  align-self: stretch !important;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 32vh; /* limit vertical footprint */
  overflow: auto; /* scroll when content overflows */
  scroll-padding-bottom: 0.75rem;
  scroll-padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}

:global(.glightbox-container .gslide-media) {
  align-self: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
  max-width: min(92vw, 70rem);
}

/* Tight padding + remove default borders/background bleed */
:global(.glightbox-container .gdesc-inner) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0.5rem 0.75rem !important;
  display: block;
  width: fit-content;
  max-width: min(92vw, 70rem);
  margin-left: auto;
  margin-right: auto;
  text-align: left;
}

:global(.glightbox-container .gdesc-inner > *) {
  max-width: 100%;
}

/* Tighter typography for title and description inside caption */
:global(.glightbox-container .gslide-title) {
  font-size: 1rem !important; /* ~16px */
  line-height: 1.25 !important; /* ~20px */
  margin: 0 !important; /* remove default spacing */
  font-weight: 600 !important;
}

:global(.glightbox-container .gslide-title + .gslide-desc) {
  margin-top: 0.15rem !important; /* explicit narrow gap between title + desc */
}

:global(.glightbox-container .gslide-desc) {
  font-size: 0.9rem !important; /* ~14.4px */
  line-height: 1.35 !important;
  margin: 0 !important;
}

:global(.glightbox-container .gslide-desc > p:first-child) {
  margin-top: 0 !important;
}

/* Extra breathing room when GLightbox switches to the mobile layout */
:global(.glightbox-mobile .glightbox-container .gslide-description) {
  padding-bottom: 3rem !important;
  padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px)) !important;
  scroll-padding-bottom: 3rem;
  scroll-padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 1024px) {
  ::global(.glightbox-container .gslide-description) {
    max-height: 24vh; /* even more compact on large screens */
  }
}

:global(.dark .glightbox-container .gslide-description) {
  background-color: rgba(15, 23, 42, 0.92) !important;
  color: #f8fafc !important;
  border: none !important;
}

:global(.dark .glightbox-container .gslide-description *) {
  background-color: transparent !important;
  color: inherit !important;
  border: none !important;
}
</style>
