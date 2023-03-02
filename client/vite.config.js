import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  host: true, //needed for docker container port mapping to work
  strictPort: true,
  port: 443,
  },
})
