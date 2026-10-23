import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ALaura-chi.github.io',
  base: '/hot100-blog',
  output: 'static',
  trailingSlash: 'always',
  markdown: { shikiConfig: { theme: 'github-dark' } },
  devToolbar: { enabled: false },
});
