import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Bhanus Studio Billing',
        short_name: 'Bhanus Bills',
        description: 'Billing application for Bhanus Studio',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/bhanus-studio-billing/',
        scope: '/bhanus-studio-billing/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 4194304 // 4 MB to accommodate logo.png (3.1 MB)
      }
    })
  ],
  base: '/bhanus-studio-billing/' // GitHub Pages base path
})
