import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // A relative base lets this same build work locally and at /Digital_Lava_Lamp/.
  base: './',
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'Digital Lava Lamp', short_name: 'Lava Lamp',
      description: 'A calm, full-screen digital lava lamp',
      theme_color: '#171638', background_color: '#171638',
      display: 'fullscreen', orientation: 'any',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,ico}'] }
  })]
});
