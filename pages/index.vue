<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import galleryFiles from "~/assets/gallery_files.json";
import galleryMetadata from "~/assets/gallery_metadata.json";

interface GalleryFile {
  filename: string;
  width: number;
  height: number;
}
interface GalleryMeta {
  filename: string;
  alt?: string;
}

const { t } = useI18n();

const slides = computed(() => {
  const files = galleryFiles as GalleryFile[];
  const selected = files.slice(0, 5);
  return selected.map((f) => {
    const meta = (galleryMetadata as GalleryMeta[]).find(
      (m) => m.filename === f.filename,
    );
    return {
      src: `/gallery/${f.filename}`,
      width: f.width,
      height: f.height,
      alt: meta?.alt || "Home slide",
    };
  });
});

const currentIndex = ref(0);
const intervalMs = 3000;
let timer: any = null;

const start = () => {
  stop();
  timer = setInterval(() => {
    const count = slides.value.length;
    if (count > 0) {
      currentIndex.value = (currentIndex.value + 1) % count;
    }
  }, intervalMs);
};
const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

onMounted(start);
onBeforeUnmount(stop);
</script>

<template>
  <section class="container mx-auto p-4">
    <div class="flex flex-col gap-6">
      <!-- Hero (centered) -->
      <div class="text-center max-w-4xl mx-auto">
        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
        >
          <span>{{ t("home.title") }}</span>
        </h1>
        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
        >
          <span>{{ t("home.name") }}</span>
        </h1>

        <p
          class="mt-3 text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200"
        >
          {{ t("home.subtitle") }}
        </p>

        <h2
          class="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold"
          v-html="t('home.tagline')"
        ></h2>
      </div>

      <!-- Slideshow -->
      <div class="relative w-full overflow-hidden rounded-lg shadow-md">
        <div
          class="relative aspect-[4/3] sm:aspect-[16/9] bg-gray-100 dark:bg-gray-800"
        >
          <transition-group name="fade" tag="div">
            <div
              v-for="(slide, idx) in slides"
              :key="`slide-${idx}-${currentIndex === idx}`"
              v-show="currentIndex === idx"
              class="absolute inset-0"
            >
              <NuxtImg
                :src="slide.src"
                :alt="slide.alt"
                class="w-full h-full object-cover"
                :width="slide.width"
                :height="slide.height"
                sizes="(max-width: 640px) 100vw, 800px"
                placeholder
                loading="eager"
                decoding="async"
              />
            </div>
          </transition-group>
        </div>
        <!-- Optional dots navigation (tap targets for mobile) -->
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            v-for="(slide, idx) in slides"
            :key="`dot-${idx}`"
            class="w-2.5 h-2.5 rounded-full"
            :class="
              currentIndex === idx
                ? 'bg-white/90 ring-2 ring-black/20'
                : 'bg-white/50'
            "
            @click="currentIndex = idx"
            aria-label="Go to slide"
          />
        </div>
      </div>

      <!-- Intro Text + Portrait -->
      <div class="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
        <div
          class="prose prose-lg sm:prose-xl dark:prose-invert max-w-none md:pr-6 prose-p:leading-relaxed prose-li:leading-relaxed prose-p:text-lg sm:prose-p:text-xl prose-li:text-lg sm:prose-li:text-xl md:col-span-2"
        >
          <h3
            class="mt-0 text-2xl sm:text-3xl md:text-4xl font-semibold"
            v-html="t('home.greeting')"
          ></h3>
          <p
            class="mt-2 text-xl sm:text-2xl md:text-2xl leading-relaxed text-gray-900 dark:text-gray-100"
            v-html="t('home.intro')"
          ></p>

          <h4
            class="mt-6 mb-4 text-xl sm:text-2xl md:text-3xl font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300"
            v-html="t('home.you_can_order')"
          ></h4>
          <ul
            class="list-disc pl-5 text-xl sm:text-2xl md:text-2xl leading-relaxed mb-4"
          >
            <li v-html="t('home.orders.marketplaces')"></li>
            <li v-html="t('home.orders.websites')"></li>
            <li v-html="t('home.orders.social')"></li>
            <li v-html="t('home.orders.recipes')"></li>
          </ul>

          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed mb-4"
            v-html="t('home.studio')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed mt-0"
            v-html="t('home.remote')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed"
            v-html="t('home.skills')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed"
            v-html="t('home.props')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed mb-4"
            v-html="t('home.precision')"
          ></p>
          <p
            class="text-xl sm:text-2xl md:text-2xl leading-relaxed"
            v-html="t('home.heart')"
          ></p>
        </div>

        <div
          class="md:pl-4 overflow-hidden self-center w-full md:col-span-1 rounded-lg shadow-md"
        >
          <NuxtImg
            src="/index.jpg"
            class="w-full h-auto object-cover aspect-[3/4] rounded-lg"
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
