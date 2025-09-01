import { defineNuxtConfig } from "nuxt/config";
import i18nConfig from "./i18n.config";
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxtjs/i18n"],
  i18n: i18nConfig,
  compatibilityDate: "2025-08-28",
  image: {
    provider: process.env.NODE_ENV === "production" ? "vercel" : "ipx",
    vercel: {
      // Comprehensive responsive widths for 1/2/3 column layouts
      // 1-col: ~100vw, 2-col: ~50vw, 3-col: ~33vw across breakpoints
      widths: [320, 480, 640, 768, 960, 1024, 1280, 1536, 1920],
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    esbuild: {
      drop: ["console", "debugger"],
    },
  },
});
