import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path:
// - local dev / preview: "/"
// - GitHub Pages project site (https://USER.github.io/REPO/): set BASE_PATH="/REPO/"
//   in CI. The deploy workflow derives it from the repository name automatically.
const base = process.env.BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
