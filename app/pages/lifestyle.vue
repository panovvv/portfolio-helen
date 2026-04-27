<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import type { GalleryImage, LightboxOptions } from "~~/types/Gallery";
import IMAGE_SOURCES_PER_SECTION from "~/assets/lifestyle_metadata.json";

const { t, locale } = useI18n();

useHead({ title: () => t("seo.lifestyle.title") });
useSeoMeta({
  ogTitle: () => t("seo.lifestyle.title"),
  description: () => t("seo.lifestyle.description"),
  ogDescription: () => t("seo.lifestyle.description"),
  twitterTitle: () => t("seo.lifestyle.title"),
  twitterDescription: () => t("seo.lifestyle.description"),
});

type GallerySection = {
  id: string;
  titleKey: string;
  items: GalleryImage[];
};

const gallerySections = computed<GallerySection[]>(() =>
  IMAGE_SOURCES_PER_SECTION.map(({ id, files }) => ({
    id,
    titleKey: `lifestyle.sections.${id}.title`,
    items: files.map((filename) => ({ href: `/${id}/${filename}` })),
  })),
);

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
    <h1 class="page-heading">{{ t("lifestyle.title") }}</h1>
    <hr class="section-sep" />

    <section
      v-for="section in gallerySections"
      :key="`${locale}-${section.id}`"
      class="lifestyle-section"
    >
      <h2 class="section-heading">
        {{ t(section.titleKey) }}
      </h2>
      <Gallery
        :items="section.items"
        :gallery-id="section.id"
        v-bind="lightboxOptions"
      />
    </section>

    <hr class="section-sep" />
    <div class="mt-10 mb-6">
      <div
        class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
      >
        <a
          href="mailto:panovaed89@gmail.com"
          class="flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full sm:w-auto"
        >
          <FontAwesomeIcon
            :icon="faEnvelope"
            class="mr-3 text-blue-500 text-2xl align-middle relative top-[2px] shrink-0"
          />
          <span class="align-middle leading-none">panovaed89@gmail.com</span>
        </a>
        <a
          href="https://www.instagram.com/panipanovahelen/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full sm:w-auto"
        >
          <FontAwesomeIcon
            :icon="faInstagram"
            class="mr-3 text-pink-500 text-2xl align-middle relative top-[2px] shrink-0"
          />
          <span class="align-middle leading-none">@panipanovahelen</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-heading {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}
.section-sep {
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 1.25rem 0 1.5rem;
}
:global(.dark) .section-sep {
  border-top-color: rgba(255, 255, 255, 0.15);
}
.section-heading {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.lifestyle-section + .lifestyle-section {
  --section-gap: 3rem;
  position: relative;
  margin-top: 0;
  padding-top: var(--section-gap);
}
.lifestyle-section + .lifestyle-section::before {
  content: "";
  position: absolute;
  top: calc(var(--section-gap) / 2);
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.18);
  border-radius: 1px;
  z-index: 1;
}
:global(.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(255, 255, 255, 0.6);
}
:global(html.dark) .lifestyle-section + .lifestyle-section::before,
:global(body.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(255, 255, 255, 0.75);
}

@media (prefers-color-scheme: dark) {
  .section-sep {
    border-top-color: rgba(255, 255, 255, 0.15);
  }
  .lifestyle-section + .lifestyle-section::before {
    background-color: rgba(255, 255, 255, 0.75);
  }
}

:global(html:not(.dark)) .section-sep {
  border-top-color: rgba(0, 0, 0, 0.2);
}
:global(html:not(.dark)) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(0, 0, 0, 0.36);
  height: 2px;
}
:global(html.dark) .lifestyle-section + .lifestyle-section::before,
:global(body.dark) .lifestyle-section + .lifestyle-section::before,
:global(.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(255, 255, 255, 0.9);
  height: 2px;
}

html:not(.dark) .section-sep {
  border-top-color: rgba(0, 0, 0, 0.5) !important;
}
html:not(.dark) .lifestyle-section + .lifestyle-section::before {
  background-color: rgba(0, 0, 0, 0.65) !important;
  height: 2px !important;
  width: 140px;
}
</style>
