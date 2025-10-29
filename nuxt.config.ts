import { defineNuxtConfig } from "nuxt/config";
import i18nConfig from "./i18n.config";
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxtjs/i18n", "nuxt-easy-lightbox"],
  i18n: i18nConfig,
  compatibilityDate: "2025-08-28",
  image: {
    provider: process.env.NODE_ENV === "production" ? "vercel" : "ipx",
    // Define screen breakpoints up to 8K so sizes mapping can use them
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1536,
      "3xl": 2048,
      "4xl": 2560,
      "5xl": 3072,
      "6xl": 3840,
      "7xl": 4096,
      "8xl": 5120,
      "9xl": 6144,
      "10xl": 7680,
    },
    vercel: {
      // https://image.nuxt.com/get-started/configuration#screens
      // Extend widths so ultra-wide screens can request near-original sizes, up to 8K
      widths: [
        320, 640, 768, 1024, 1280, 1536, 2048, 2560, 3072, 3840, 4096, 5120,
        6144, 7680,
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    esbuild: {
      drop: ["console", "debugger"],
    },
  },
});
