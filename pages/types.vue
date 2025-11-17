<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import galleryImages from "~/assets/gallery_files.json";

const { t, tm } = useI18n();

type FileDim = { filename: string; width: number; height: number };
const dimsMap = new Map<string, { width: number; height: number }>();
for (const f of galleryImages as FileDim[]) {
  dimsMap.set(f.filename, { width: f.width, height: f.height });
}

const images: string[] = [
  "/gallery/collagen/collagen_006.jpg", // Catalog
  "/gallery/brand/brand_014.jpg", // Product photography
  "/gallery/brand/brand_007.jpg", // Content
  "/gallery/brand/brand_003.jpg", // Lifestyle
  "/gallery/food/food_013.jpg", // Storytelling
  "/gallery/food/food_021.jpg", // Image shoot
  "/gallery/brand/brand_001.jpg", // Advertising
  "/gallery/brand/brand_006.jpg", // Creative
  "/gallery/food/food_002.jpg", // Recipes
  "/gallery/food/food_027.jpg", // Outdoor
];

function getDims(path: string): { width?: number; height?: number } {
  if (!path) return {};
  // Convert src to manifest key
  if (path.startsWith("/gallery/")) {
    const key = path.slice("/gallery/".length);
    const d = dimsMap.get(key);
    return d || {};
  }
  const key = path.startsWith("/") ? path.slice(1) : path;
  const d = dimsMap.get(key);
  return d || {};
}

const items = computed(() => (tm("types.items") as any[]) || []);
</script>

<template>
  <div class="container mx-auto px-4 py-8 sm:py-10 md:py-12">
    <h1
      class="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 sm:mb-8 md:mb-10"
    >
      {{ t("types.title") }}
    </h1>

    <div class="space-y-10 sm:space-y-12 md:space-y-14">
      <section v-for="(item, idx) in items" :key="idx">
        <div
          class="grid md:grid-cols-2 gap-6 md:gap-8 items-start md:items-center"
        >
          <!-- Text block -->
          <div
            class="order-1 md:order-1 prose prose-lg sm:prose-xl dark:prose-invert max-w-none md:pr-6 prose-p:leading-relaxed prose-li:leading-relaxed prose-p:text-lg sm:prose-p:text-xl prose-li:text-lg sm:prose-li:text-xl"
          >
            <h3 class="mt-0 text-2xl sm:text-3xl md:text-4xl font-semibold">
              {{ t(item.title) }}
            </h3>
            <p class="mt-2 text-xl sm:text-2xl md:text-2xl leading-relaxed">
              {{ t(item.desc) }}
            </p>
          </div>

          <!-- Image block -->
          <div class="order-2 md:order-2 mt-2 md:mt-0 md:pl-4">
            <div class="type-image-frame">
              <NuxtImg
                :src="images[idx] || '/portrait.jpg'"
                class="type-image"
                sizes="160px xs:320px sm:640px md:384px lg:512px xl:640px 2xl:768px 3xl:1024px 4xl:1280px 5xl:1536px 6xl:1920px 7xl:2048px 8xl:2560px 9xl:3072px 10xl:3840px"
                placeholder
                loading="lazy"
                :width="getDims(images[idx]).width"
                :height="getDims(images[idx]).height"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.type-image-frame {
  --type-shadow-light: rgba(15, 23, 42, 0.15);
  --type-shadow-dark: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 12px 28px var(--type-shadow-light);
  background: transparent;
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

.type-image :deep(.nuxt-img-placeholder) {
  display: none;
}
</style>
