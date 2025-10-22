<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useColorMode } from "#imports";
import { useRoute } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faMoon,
  faSun,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const route = useRoute();
const { locale, locales, t, setLocale } = useI18n();

const currentLocale = computed({
  get: () => locale.value,
  set: (newLocale) => setLocale(newLocale),
});

const languageOptions = computed(() =>
  locales.value.map((l) => ({ value: l.code, label: l.name })),
);

const colorMode = useColorMode();
if (colorMode.preference === "system") {
  colorMode.preference = colorMode.value;
}
const currentTheme = computed(() => colorMode.value);
const toggleTheme = () => {
  colorMode.preference = currentTheme.value === "light" ? "dark" : "light";
};

const isMenuOpen = ref(false);
watch(
  () => route.path,
  () => {
    // Close menu on route change
    isMenuOpen.value = false;
  },
);

// Each link should keep its original horizontal padding (px-4) and vertical padding (py-2)
// but then be forced to fill the navbar height (h-16) by adding a wrapper that has that height.
const getSectionClasses = (path: string) => {
  // We wrap the link's content in a div that forces it to fill h-16.
  const base = "px-4 py-2 rounded transition-colors duration-200";
  const active =
    currentTheme.value === "light"
      ? "bg-blue-600 text-white"
      : "bg-blue-500 text-white";
  const hover =
    currentTheme.value === "light"
      ? "hover:bg-blue-100 hover:text-blue-600"
      : "hover:bg-gray-700 hover:text-blue-300";
  return route.path === path ? `${base} ${active}` : `${base} ${hover}`;
};
</script>

<template>
  <header>
    <!-- Sticky, responsive navbar -->
    <nav
      class="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200/60 dark:border-gray-700/60"
    >
      <div class="container mx-auto px-3">
        <div class="h-16 flex items-center justify-between relative">
          <!-- Left section: Hamburger (mobile) + Desktop links -->
          <div class="flex items-center">
            <!-- Hamburger button visible on small screens -->
            <button
              type="button"
              class="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              :aria-expanded="isMenuOpen ? 'true' : 'false'"
              aria-controls="primary-menu"
              aria-label="Toggle navigation menu"
              @click="isMenuOpen = !isMenuOpen"
            >
              <FontAwesomeIcon
                v-if="!isMenuOpen"
                :icon="faBars"
                class="h-6 w-6"
              />
              <FontAwesomeIcon v-else :icon="faTimes" class="h-6 w-6" />
            </button>

            <!-- Desktop navigation links -->
            <div class="hidden md:flex md:ml-2 space-x-2">
              <NuxtLink to="/" class="h-16 flex">
                <div
                  class="flex-1 flex items-center justify-center"
                  :class="getSectionClasses('/')"
                >
                  {{ t("navbar.home") }}
                </div>
              </NuxtLink>
              <NuxtLink to="/portfolio" class="h-16 flex">
                <div
                  class="flex-1 flex items-center justify-center"
                  :class="getSectionClasses('/portfolio')"
                >
                  {{ t("navbar.portfolio") }}
                </div>
              </NuxtLink>
              <NuxtLink to="/types" class="h-16 flex">
                <div
                  class="flex-1 flex items-center justify-center"
                  :class="getSectionClasses('/types')"
                >
                  {{ t("navbar.types") }}
                </div>
              </NuxtLink>
              <NuxtLink to="/lifestyle" class="h-16 flex">
                <div
                  class="flex-1 flex items-center justify-center"
                  :class="getSectionClasses('/lifestyle')"
                >
                  {{ t("navbar.lifestyle") }}
                </div>
              </NuxtLink>
              <NuxtLink to="/about" class="h-16 flex">
                <div
                  class="flex-1 flex items-center justify-center"
                  :class="getSectionClasses('/about')"
                >
                  {{ t("navbar.about") }}
                </div>
              </NuxtLink>
              <NuxtLink to="/contact" class="h-16 flex">
                <div
                  class="flex-1 flex items-center justify-center"
                  :class="getSectionClasses('/contact')"
                >
                  {{ t("navbar.contact") }}
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Right section: Theme & language -->
          <div class="flex space-x-3 items-center h-16">
            <button
              @click="toggleTheme"
              aria-label="Toggle theme"
              class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <FontAwesomeIcon
                v-if="currentTheme === 'light'"
                :icon="faMoon"
                class="h-6 w-6"
              />
              <FontAwesomeIcon v-else :icon="faSun" class="h-6 w-6" />
            </button>
            <USelect
              v-model="currentLocale"
              :items="languageOptions"
              item-label="label"
              item-value="value"
              class="min-w-[120px] sm:min-w-[150px] text-sm"
            />
          </div>

          <!-- Mobile dropdown menu -->
          <div
            id="primary-menu"
            class="md:hidden absolute top-16 left-0 right-0 shadow-lg border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95"
            v-show="isMenuOpen"
          >
            <nav class="flex flex-col py-2">
              <NuxtLink to="/" class="px-4 py-3" @click="isMenuOpen = false">
                {{ t("navbar.home") }}
              </NuxtLink>
              <NuxtLink
                to="/portfolio"
                class="px-4 py-3"
                @click="isMenuOpen = false"
              >
                {{ t("navbar.portfolio") }}
              </NuxtLink>
              <NuxtLink
                to="/types"
                class="px-4 py-3"
                @click="isMenuOpen = false"
              >
                {{ t("navbar.types") }}
              </NuxtLink>
              <NuxtLink
                to="/about"
                class="px-4 py-3"
                @click="isMenuOpen = false"
              >
                {{ t("navbar.about") }}
              </NuxtLink>
              <NuxtLink
                to="/contact"
                class="px-4 py-3"
                @click="isMenuOpen = false"
              >
                {{ t("navbar.contact") }}
              </NuxtLink>
            </nav>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
