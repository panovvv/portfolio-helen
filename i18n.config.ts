import type { NuxtI18nOptions } from "@nuxtjs/i18n";

const i18nConfig: NuxtI18nOptions = {
  defaultLocale: "en",
  locales: [
    { code: "en", name: "English", iso: "en-US" },
    { code: "ru", name: "Русский", iso: "ru-RU" },
  ],
  strategy: "no_prefix",
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    fallbackLocale: "en",
  },
  vueI18n: "./vue-i18n.config.ts",
};

export default i18nConfig;
