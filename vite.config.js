import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Use VITE_WP_REST_URL if set, otherwise fall back to the production URL
  // Strip /wp-json suffix if present, so the proxy target is always the WP root
  const wpBase = (
    env.VITE_WP_REST_URL ||
    // 'https://darkred-worm-224502.hostingersite.com/wp-json'
    'https://mediumvioletred-cod-278845.hostingersite.com/wp-json'
  ).replace(/\/wp-json\/?$/, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy all /wp-json requests to WordPress to avoid CORS in dev
        '/wp-json': {
          target: wpBase,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path, // keep /wp-json prefix intact
        },
      },
    },
  }
})
