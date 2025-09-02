<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faTelegram,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="bg-white dark:bg-gray-900">
    <div class="container mx-auto p-4">
      <div class="flex flex-col max-w-3xl mx-auto">
        <p
          class="text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100"
        >
          {{ t("contact.intro") }}
        </p>

        <div class="border-l-4 border-blue-600 pl-4 mt-6 space-y-4">
          <p
            class="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400"
          >
            {{ t("contact.write_me") }}
          </p>

          <ul class="space-y-4">
            <li>
              <a
                href="https://wa.me/351933699190"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full"
              >
                <FontAwesomeIcon
                  :icon="faWhatsapp"
                  class="mr-3 text-green-500 text-2xl align-middle relative top-[2px] shrink-0"
                />
                <span class="align-middle leading-none">
                  {{ t("contact.messengers.whatsapp") }}
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://t.me/panipanovahelen"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full"
              >
                <FontAwesomeIcon
                  :icon="faTelegram"
                  class="mr-3 text-sky-500 text-2xl align-middle relative top-[2px] shrink-0"
                />
                <span class="align-middle leading-none">
                  {{ t("contact.messengers.telegram") }}
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://www.instagram.com/panipanovahelen/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full"
              >
                <FontAwesomeIcon
                  :icon="faInstagram"
                  class="mr-3 text-pink-500 text-2xl align-middle relative top-[2px] shrink-0"
                />
                <span class="align-middle leading-none">
                  {{ t("contact.messengers.instagram") }}
                </span>
              </a>
            </li>
          </ul>

          <p
            class="text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100"
          >
            {{ t("contact.or_email") }}
          </p>

          <ul class="space-y-4">
            <li>
              <a
                href="mailto:panovaed89@gmail.com"
                class="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 w-full"
              >
                <FontAwesomeIcon
                  :icon="faEnvelope"
                  class="mr-3 text-blue-500 text-2xl align-middle relative top-[2px] shrink-0"
                />
                <span class="align-middle leading-none">
                  panovaed89@gmail.com
                </span>
              </a>
            </li>
          </ul>
        </div>

        <p
          class="mt-6 text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100"
        >
          {{ t("contact.location") }}
        </p>

        <p
          class="text-left text-lg sm:text-xl md:text-xl leading-relaxed text-gray-900 dark:text-gray-100"
        >
          {{ t("contact.shipping") }}
        </p>

        <p
          class="mt-6 text-center text-lg sm:text-xl md:text-2xl font-semibold text-blue-600 dark:text-blue-400"
          v-html="t('contact.note')"
        ></p>
      </div>
    </div>

    <div class="relative mt-3">
      <NuxtImg
        src="/contacts.jpg"
        class="w-full h-auto object-contain"
        placeholder
        loading="lazy"
        decoding="async"
      />
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white dark:from-gray-900 to-transparent"
      ></div>
    </div>
  </div>
</template>
