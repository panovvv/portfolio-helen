<script setup lang="ts">
import { clearError } from "#app";
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const redirectHome = () => clearError({ redirect: "/" });
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-100 dark:bg-gray-900 dark:text-white"
  >
    <h1 class="text-4xl font-bold mb-4">
      <span v-if="error?.statusCode === 404">Page Not Found</span>
      <span v-else>Error {{ error?.statusCode || "Unknown" }}</span>
    </h1>
    <p class="text-lg mb-8">
      {{ error?.message || "An unexpected error occurred." }}
    </p>
    <NuxtLink
      @click="redirectHome"
      class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
    >
      Go back home
    </NuxtLink>
  </div>
</template>
