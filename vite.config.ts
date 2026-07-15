import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: funciona em GitHub Pages independente do nome do repositório
  base: './',
  plugins: [vue()],
})
