<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

const { t, tm } = useI18n();

useSeoMeta({
  title: () => t("seo.types.title"),
  ogTitle: () => t("seo.types.title"),
  description: () => t("seo.types.description"),
  ogDescription: () => t("seo.types.description"),
  twitterTitle: () => t("seo.types.title"),
  twitterDescription: () => t("seo.types.description"),
});

const SHOOT_TYPES = [
  { image: "/gallery/05-collagen/03.jpg", tag: "collagen" },
  { image: "/gallery/07-packaging/09.jpg", tag: "packaging" },
  { image: "/gallery/07-packaging/10.jpg", tag: "packaging" },
  { image: "/gallery/10-creative/07.jpg", tag: "creative" },
  { image: "/gallery/10-creative/11.jpg", tag: "creative" },
  { image: "/gallery/07-packaging/07.jpg", tag: "packaging" },
  { image: "/gallery/07-packaging/03.jpg", tag: "packaging" },
  { image: "/gallery/10-creative/17.jpg", tag: "creative" },
  { image: "/gallery/08-food/02.jpg", tag: "food" },
  { image: "/gallery/09-outdoor/13.jpg", tag: "outdoor" },
];

/** Change this to experiment with alternation frequency */
const GROUP_SIZE = 2;

const items = computed(() => (tm("types.items") as any[]) || []);

const NUM_GROUPS = Math.ceil(SHOOT_TYPES.length / GROUP_SIZE);

const groups = computed(() =>
  Array.from({ length: NUM_GROUPS }, (_, g) => ({
    start: g * GROUP_SIZE,
    items: SHOOT_TYPES.slice(g * GROUP_SIZE, (g + 1) * GROUP_SIZE),
    imageRight: g % 2 === 0,
  })),
);

/* ---- Active image tracking ---- */

const activeIndex = ref(0);

function groupActiveLocal(gIdx: number): number {
  const start = gIdx * GROUP_SIZE;
  const end = Math.min(start + GROUP_SIZE, SHOOT_TYPES.length) - 1;
  return Math.max(start, Math.min(activeIndex.value, end)) - start;
}

/* ---- Scroll tracking ---- */

const sectionEls = ref<(HTMLElement | null)[]>([]);
let raf = 0;

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const mid = window.innerHeight / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sectionEls.value.length; i++) {
      const el = sectionEls.value[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    activeIndex.value = bestIdx;
  });
}

/* ---- Entrance animations ---- */

let animObserver: IntersectionObserver | null = null;
const allAnimEls = ref<(HTMLElement | null)[]>([]);

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  animObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          animObserver!.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  for (const el of allAnimEls.value) {
    if (el) animObserver.observe(el);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (raf) cancelAnimationFrame(raf);
  animObserver?.disconnect();
});

// Mobile: full-viewport-width images (below md)
const MOBILE_IMG_SIZES = "320px xs:480px sm:640px md:768px";
// Desktop: half-grid images (md+)
const DESKTOP_IMG_SIZES = "md:384px lg:512px xl:640px 2xl:768px";
</script>

<template>
  <div>
    <div class="container mx-auto p-4">
      <!-- DESKTOP: sticky scroll (md+) -->
      <div class="hidden md:block">
        <div
          v-for="(group, gIdx) in groups"
          :key="gIdx"
          class="grid md:grid-cols-2 gap-6 md:gap-8"
          :class="gIdx > 0 ? 'mt-16 lg:mt-24' : ''"
        >
          <!-- Text column -->
          <div
            class="flex flex-col"
            :class="
              group.imageRight ? 'md:order-1 md:pr-6' : 'md:order-2 md:pl-6'
            "
          >
            <div
              v-for="(_, lIdx) in group.items"
              :key="lIdx"
              :ref="
                (el) => {
                  sectionEls[group.start + lIdx] = el as HTMLElement;
                  allAnimEls[group.start + lIdx] = el as HTMLElement;
                }
              "
              class="fade-in-section"
              :class="{
                'pt-[25vh]': lIdx === 0,
                'pb-[25vh]': lIdx === group.items.length - 1,
                'mt-[50vh]': lIdx > 0,
              }"
            >
              <div class="flex items-baseline gap-4 mb-3">
                <span class="number-badge">
                  {{ String(group.start + lIdx + 1).padStart(2, "0") }}
                </span>
                <h3 class="text-2xl sm:text-3xl md:text-4xl font-semibold">
                  {{ t(items[group.start + lIdx]?.title ?? "") }}
                </h3>
              </div>
              <p
                class="text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-300 mb-4"
              >
                {{ t(items[group.start + lIdx]?.desc ?? "") }}
              </p>
              <NuxtLink
                :to="{
                  path: '/portfolio',
                  query: { tag: SHOOT_TYPES[group.start + lIdx].tag },
                }"
                class="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-base sm:text-lg"
              >
                {{ t("types.see_examples") }}
                <span aria-hidden="true">&rarr;</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Sticky image column -->
          <div
            :class="
              group.imageRight ? 'md:order-2 md:pl-4' : 'md:order-1 md:pr-4'
            "
          >
            <div class="sticky-image-wrap">
              <div class="type-image-frame crossfade-stack">
                <NuxtImg
                  v-for="(type, lIdx) in group.items"
                  :key="lIdx"
                  :src="type.image"
                  :sizes="DESKTOP_IMG_SIZES"
                  class="type-image crossfade-img"
                  :class="{ active: groupActiveLocal(gIdx) === lIdx }"
                  placeholder
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE: scroll-snap full-screen cards (below md) -->
    <div class="mobile-snap-container md:hidden">
      <section
        v-for="(type, idx) in SHOOT_TYPES"
        :key="idx"
        :ref="
          (el) => {
            allAnimEls[SHOOT_TYPES.length + idx] = el as HTMLElement;
          }
        "
        class="mobile-snap-card"
      >
        <NuxtImg
          :src="type.image"
          :sizes="MOBILE_IMG_SIZES"
          class="mobile-card-img"
          placeholder
          loading="lazy"
        />
        <div class="mobile-text" :class="'mobile-text-shadow'">
          <div class="flex items-baseline gap-4 mb-3">
            <span class="number-badge">
              {{ String(idx + 1).padStart(2, "0") }}
            </span>
            <h3 class="text-2xl sm:text-3xl font-semibold">
              {{ t(items[idx]?.title ?? "") }}
            </h3>
          </div>
          <p class="text-lg sm:text-xl leading-relaxed mb-4">
            {{ t(items[idx]?.desc ?? "") }}
          </p>
          <NuxtLink
            :to="{ path: '/portfolio', query: { tag: type.tag } }"
            class="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-base sm:text-lg"
          >
            {{ t("types.see_examples") }}
            <span aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sticky-image-wrap {
  position: sticky;
  top: 4rem;
  height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  padding: 2rem 0;
  box-sizing: border-box;
}

.type-image-frame {
  --type-shadow-light: rgba(15, 23, 42, 0.15);
  --type-shadow-dark: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 12px 28px var(--type-shadow-light);
  background: transparent;
  max-height: calc(100vh - 4rem);
}

:global(.dark) .type-image-frame {
  box-shadow: 0 12px 28px var(--type-shadow-dark);
}

.type-image {
  display: block;
  width: 100%;
  height: auto;
  border: 0;
  outline: none;
  box-shadow: none;
}

.crossfade-stack {
  position: relative;
}

.crossfade-img {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.crossfade-img.active {
  opacity: 1;
  position: relative;
}

.type-image :deep(.nuxt-img-placeholder) {
  display: none;
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: color-mix(
    in srgb,
    var(--color-primary-500) 15%,
    transparent
  );
  color: var(--color-primary-600);
  font-weight: 700;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

:global(.dark) .number-badge {
  background-color: color-mix(
    in srgb,
    var(--color-primary-400) 20%,
    transparent
  );
  color: var(--color-primary-400);
}

/* Mobile scroll-snap — fixed to viewport so nothing else interferes */
.mobile-snap-container {
  position: fixed;
  inset: 0;
  z-index: 40;
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  background: var(--color-background, #fff);
}

.mobile-snap-card {
  scroll-snap-align: start;
  position: relative;
  height: 100dvh;
}

.mobile-card-img,
.mobile-card-img :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mobile-text {
  position: absolute;
  top: 4rem; /* clear navbar h-16 */
  left: 0;
  right: 0;
  padding: 1rem;
}

.mobile-text-shadow {
  color: #e5e7eb;
  text-shadow:
    -1px -1px 1px rgba(0, 0, 0, 0.45),
    1px -1px 1px rgba(0, 0, 0, 0.45),
    -1px 1px 1px rgba(0, 0, 0, 0.45),
    1px 1px 1px rgba(0, 0, 0, 0.45);
}

.mobile-text-shadow p {
  color: #d1d5db;
}

.mobile-text-shadow .number-badge {
  background-color: color-mix(
    in srgb,
    var(--color-primary-400) 20%,
    transparent
  );
  color: var(--color-primary-400);
}

.fade-in-section {
  opacity: 0;
  transform: translateY(2rem);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.fade-in-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
