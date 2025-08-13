import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Passe den Pfad an, falls dein Repo nicht username.github.io heißt
  // Beispiel: base: '/privileg-check/'
  base: '/privileg-check/',
})
