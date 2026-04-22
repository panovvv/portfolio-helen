import { defineNuxtConfig } from "nuxt/config";
import { provider as ciProvider, env } from "std-env";
import i18nConfig from "./i18n.config";
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
  ],
  i18n: i18nConfig,
  compatibilityDate: "2025-08-28",
  site: {
    url: "https://panova.photography",
  },
  app: {
    head: {
      meta: [
        {
          name: "description",
          content:
            "Elena Panova — professional product and food photographer in Porto, Portugal. Striking photos for marketplaces, websites, and social media.",
        },
        { name: "author", content: "Elena Panova" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Elena Panova Photography" },
        { property: "og:locale", content: "en_US" },
        {
          property: "og:image",
          content: "https://panova.photography/og-image.jpg",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:image",
          content: "https://panova.photography/og-image.jpg",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },
  sitemap: {
    urls: [
      { loc: "/", changefreq: "weekly", priority: 1.0 },
      { loc: "/portfolio", changefreq: "weekly", priority: 0.9 },
      { loc: "/types", changefreq: "monthly", priority: 0.7 },
      { loc: "/lifestyle", changefreq: "monthly", priority: 0.7 },
      { loc: "/about", changefreq: "monthly", priority: 0.6 },
      { loc: "/contact", changefreq: "monthly", priority: 0.6 },
    ],
  },
  robots: {
    allow: "/",
    sitemap: "https://panova.photography/sitemap.xml",
  },
  image: {
    provider:
      env.NUXT_IMAGE_PROVIDER ??
      (ciProvider === "vercel" || env.VERCEL === "1" ? "vercel" : "ipx"),
    // https://image.nuxt.com/get-started/configuration#screens
    // Extend widths so ultra-wide screens can request near-original sizes, up to 8K
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
