<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import {
  faTelegram,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
</script>

<template>
  <div
    class="w-full min-h-screen p-6 dark:bg-gray-900 dark:text-white flex flex-col items-center"
  >
    <h1 class="text-3xl font-bold mb-6">Reach me at</h1>
    <ul class="space-y-4">
      <!-- WhatsApp -->
      <li class="flex items-center">
        <FontAwesomeIcon :icon="faWhatsapp" class="mr-3" />
        <a
          href="https://wa.me/351933699190"
          target="_blank"
          rel="noopener noreferrer"
          class="underline"
        >
          +351 933 699 190
        </a>
      </li>
      <!-- Instagram -->
      <li class="flex items-center">
        <FontAwesomeIcon :icon="faInstagram" class="mr-3" />
        <a
          href="https://www.instagram.com/panipanovahelen/"
          target="_blank"
          rel="noopener noreferrer"
          class="underline"
        >
          panipanovahelen
        </a>
      </li>
      <!-- Telegram -->
      <li class="flex items-center">
        <FontAwesomeIcon :icon="faTelegram" class="mr-3" />
        <a
          href="https://t.me/panipanovahelen"
          target="_blank"
          rel="noopener noreferrer"
          class="underline"
        >
          @panipanovahelen
        </a>
      </li>
      <!-- Email -->
      <li class="flex items-center">
        <FontAwesomeIcon :icon="faEnvelope" class="mr-3" />
        <a href="mailto:panovaed89@gmail.com" class="underline">
          panovaed89@gmail.com
        </a>
      </li>
      <!-- Phone -->
      <li class="flex items-center">
        <FontAwesomeIcon :icon="faPhone" class="mr-3" />
        <a href="tel:+351933699190" class="underline"> +351 933 699 190 </a>
      </li>
    </ul>
  </div>
</template>
