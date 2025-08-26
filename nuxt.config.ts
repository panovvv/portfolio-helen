import { defineNuxtConfig } from "nuxt/config";
import i18nConfig from "./i18n.config";
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxtjs/i18n"],
  i18n: i18nConfig,
  image: {
    provider: process.env.NODE_ENV === "production" ? "vercel" : "ipx",
    vercel: {
      widths: [400],
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    esbuild: {
      drop: ["console", "debugger"],
    },
  },
});
