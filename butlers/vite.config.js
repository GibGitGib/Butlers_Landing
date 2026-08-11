import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const page = (name) => fileURLToPath(new URL(`./${name}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        intake: page('intake-form.html'),
        report: page('demo-report.html'),
        privacy: page('privacy.html'),
        terms: page('terms.html'),
        cookies: page('cookies.html'),
      },
    },
  },
})
