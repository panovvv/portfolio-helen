import { defineNuxtConfig } from "nuxt/config";
import i18nConfig from "./i18n.config";
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxtjs/i18n"],
  i18n: i18nConfig,
  compatibilityDate: "2025-08-28",
  image: {
    provider: process.env.NODE_ENV === "production" ? "vercel" : "ipx",
    vercel: {
      // Provide multiple responsive widths so Nuxt Image can downscale effectively
      widths: [320, 480, 640, 768, 960, 1200, 1600],
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    esbuild: {
      drop: ["console", "debugger"],
    },
  },
});
