// @ts-check
import { defineConfig } from 'astro/config';

// Preview deployment on GitHub Pages. At cutover, `site` becomes the course
// domain and `base` becomes '/'.
export default defineConfig({
  site: 'https://arvinduh.github.io',
  base: '/tac-459',
  trailingSlash: 'always',
});
