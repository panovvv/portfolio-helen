<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t, tm } = useI18n();
const firstLine = (tm("about.firstLine") as string) || "";
const description = (tm("about.description") as any[]) || [];
const finalLine = (tm("about.finalLine") as string) || "";
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div class="flex flex-col justify-center md:pr-6">
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-6 sm:mb-8 md:mb-10"
        >
          {{ t("about.title") }}
        </h1>

        <p
          class="mt-0 first:mt-0 text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100"
          v-html="firstLine"
        ></p>

        <template v-for="(line, idx) in description" :key="idx">
          <p
            class="mt-0 first:mt-0 text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100"
            v-html="line"
          ></p>
        </template>

        <p
          class="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold text-blue-600 dark:text-blue-400"
          v-html="finalLine"
        ></p>

        <div class="mt-6">
          <NuxtLink
            to="/contact"
            class="inline-block px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow text-base sm:text-lg"
          >
            {{ t("about.cta") }}
          </NuxtLink>
        </div>
      </div>

      <div class="self-center w-full h-full flex">
        <NuxtImg
          src="/about-me.jpg"
          class="w-full h-auto object-contain rounded-lg shadow-md"
          placeholder
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </div>
</template>
