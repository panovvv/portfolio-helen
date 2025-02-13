import type { VueI18nOptions } from "vue-i18n";

const config: VueI18nOptions = {
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      navbar: {
        home: "Home",
        portfolio: "Portfolio",
        contact: "Contact",
        colorscheme: {
          system: "Default theme (system)",
          light: "Light theme",
          dark: "Dark theme",
        },
      },
      contact: {
        reach_me_at: "Reach me at",
      },
    },
    ru: {
      navbar: {
        home: "Главная",
        portfolio: "Портфолио",
        contact: "Контакты",
        colorscheme: {
          system: "Тема по умолчанию (системная)",
          light: "Светлая тема",
          dark: "Тёмная тема",
        },
      },
      contact: {
        reach_me_at: "Контакты",
      },
    },
  },
};

export default config;
