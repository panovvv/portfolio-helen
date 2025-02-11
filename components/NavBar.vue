<script setup lang="ts"></script>

<template>
  <header>
    <nav class="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div class="flex space-x-4">
        <NuxtLink to="/" class="mr-4 hover:underline">Home</NuxtLink>
        <NuxtLink to="/portfolio" class="mr-4 hover:underline"
          >Portfolio</NuxtLink
        >
        <NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink>
      </div>
      <ColorScheme
        ><USelect
          v-model="$colorMode.preference"
          :options="['system', 'light', 'dark']"
      /></ColorScheme>
    </nav>
  </header>
</template>
