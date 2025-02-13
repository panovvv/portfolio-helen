<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale, locales, t, setLocale } = useI18n();

const currentLocale = computed({
  get: () => locale.value,
  set: (newLocale) => {
    setLocale(newLocale);
  },
});

const languageOptions = computed(() =>
  locales.value.map((l) => ({ value: l.code, label: l.name })),
);

const colorOptions = computed(() => [
  { value: "system", label: t("navbar.colorscheme.system") },
  { value: "light", label: t("navbar.colorscheme.light") },
  { value: "dark", label: t("navbar.colorscheme.dark") },
]);
</script>

<template>
  <header>
    <nav class="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div class="flex space-x-4">
        <NuxtLink to="/">{{ t("navbar.home") }}</NuxtLink>
        <NuxtLink to="/portfolio">{{ t("navbar.portfolio") }}</NuxtLink>
        <NuxtLink to="/contact">{{ t("navbar.contact") }}</NuxtLink>
      </div>
      <div class="flex space-x-4 items-center">
        <ColorScheme>
          <USelect
            v-model="$colorMode.preference"
            :options="colorOptions"
            option-label="label"
            option-value="value"
          />
        </ColorScheme>
        <USelect
          v-model="currentLocale"
          :options="languageOptions"
          option-label="label"
          option-value="value"
        />
      </div>
    </nav>
  </header>
</template>
