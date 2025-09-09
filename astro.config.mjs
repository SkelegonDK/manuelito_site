// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
  prefetch: {
    prefetchAll: true,
  },
  site: 'https://manuelito.tech',
  output: 'static',
  integrations: [
    react(),
    mdx(),
    sitemap(),
    tailwind(),
    icon({
      include: {
        fa: ['*'],
        fa6solid: ['*'],
        fa6regular: ['*'],
        fa6brands: ['*'],
        bi: ['*'],
      }
    }),
  ]
});
