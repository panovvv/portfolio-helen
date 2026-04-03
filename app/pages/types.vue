<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, tm } = useI18n();

const images: string[] = [
  "/gallery/05-collagen/03.jpg", // Catalog
  "/gallery/07-packaging/09.jpg", // Product photography
  "/gallery/07-packaging/10.jpg", // Content
  "/gallery/10-creative/07.jpg", // Lifestyle
  "/gallery/10-creative/11.jpg", // Storytelling
  "/gallery/07-packaging/07.jpg", // Image shoot
  "/gallery/07-packaging/03.jpg", // Advertising
  "/gallery/10-creative/17.jpg", // Creative
  "/gallery/08-food/02.jpg", // Recipes
  "/gallery/09-plein-air/13.jpg", // Outdoor
];

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
