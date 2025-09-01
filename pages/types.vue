<script setup lang="ts">
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

const items = (tm("types.items") as any[]) || [];
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
          class="grid md:grid-cols-3 gap-6 md:gap-8 items-start md:items-center"
        >
          <!-- Text block -->
          <div
            class="order-1 md:order-1 prose prose-lg sm:prose-xl dark:prose-invert max-w-none md:pr-6 prose-p:leading-relaxed prose-li:leading-relaxed prose-p:text-lg sm:prose-p:text-xl prose-li:text-lg sm:prose-li:text-xl md:col-span-2"
          >
            <h3 class="mt-0 text-2xl sm:text-3xl md:text-4xl font-semibold">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-xl sm:text-2xl md:text-2xl leading-relaxed">
              {{ item.desc }}
            </p>
          </div>

          <!-- Image block -->
          <div
            class="order-2 md:order-2 mt-2 md:mt-0 md:pl-4 overflow-hidden self-center w-full md:col-span-1 rounded-lg shadow-md"
          >
            <NuxtImg
              :src="images[idx] || '/portrait.jpg'"
              class="w-full h-auto object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 33vw"
              placeholder
              loading="lazy"
              :width="getDims(images[idx]).width"
              :height="getDims(images[idx]).height"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
