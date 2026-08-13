import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/MySports/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-32.png', 'icons/icon-180.png'],
      manifest: {
        name: 'MySports',
        short_name: 'MySports',
        description: 'Live scores for NFL, NCAAF, MLB, and NHL',
        start_url: '/MySports/',
        scope: '/MySports/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Scoreboard data must always hit the network — never serve stale
        // scores from the cache. Only the app shell (JS/CSS/HTML) is
        // precached so the PWA still launches offline.
        navigateFallbackDenylist: [/^\/apis\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/site\.api\.espn\.com\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
