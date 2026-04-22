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
  const base =
    "px-4 py-2 rounded transition-colors duration-200 whitespace-nowrap leading-tight";
  const active = "bg-primary-600 text-white dark:bg-primary-500";
  const hover =
    "hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950 dark:hover:text-primary-300";
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
              class="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
            <div class="hidden lg:flex lg:ml-2 space-x-2">
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
              class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
              :content="{
                align: 'end',
                collisionPadding: 12,
                side: 'bottom',
                bodyLock: false,
              }"
              class="min-w-[120px] sm:min-w-[150px] text-sm"
            />
          </div>

          <!-- Mobile dropdown menu (client-only to avoid duplicate anchor texts in SSR) -->
          <ClientOnly>
            <div
              id="primary-menu"
              class="lg:hidden absolute top-16 left-0 right-0 shadow-lg border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95"
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
                  to="/lifestyle"
                  class="px-4 py-3"
                  @click="isMenuOpen = false"
                >
                  {{ t("navbar.lifestyle") }}
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
          </ClientOnly>
        </div>
      </div>
    </nav>
  </header>
</template>
