<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useColorMode } from "#imports";
import { useRoute } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

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
    <!-- Fixed-height navbar -->
    <nav
      class="h-16 flex flex-col sm:flex-row justify-between items-center p-2 bg-gray-800 text-white"
    >
      <!-- Navigation links container -->
      <div class="flex space-x-4">
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
        <NuxtLink to="/portfolio-2" class="h-16 flex">
          <div
            class="flex-1 flex items-center justify-center"
            :class="getSectionClasses('/portfolio-2')"
          >
            {{ t("navbar.portfolio") }}
          </div>
        </NuxtLink>
        <NuxtLink to="/portfolio-photoswipe" class="h-16 flex">
          <div
            class="flex-1 flex items-center justify-center"
            :class="getSectionClasses('/portfolio-photoswipe')"
          >
            {{ t("navbar.portfolio") }}
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
      <!-- Theme toggle and language selector -->
      <div class="flex space-x-3 items-center h-16">
        <button
          @click="toggleTheme"
          aria-label="Toggle theme"
          class="flex items-center justify-center p-2 rounded-full border-2 border-transparent hover:border-white transition-colors duration-200"
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
          :options="languageOptions"
          option-label="label"
          option-value="value"
          class="min-w-[120px] sm:min-w-[150px] text-sm"
        />
      </div>
    </nav>
  </header>
</template>
