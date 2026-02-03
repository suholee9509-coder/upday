import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import prerender from '@prerenderer/rollup-plugin'
import path from 'path'

// Routes to pre-render for SEO
const PRERENDER_ROUTES = [
  '/',
  '/timeline',
  '/timeline?category=ai',
  '/timeline?category=startup',
  '/timeline?category=science',
  '/timeline?category=space',
  '/timeline?category=dev',
  '/timeline?category=design',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer - generates stats.html when ANALYZE=true
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Pre-render pages for SEO - only in production build
    process.env.PRERENDER === 'true' && prerender({
      routes: PRERENDER_ROUTES,
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        maxConcurrentRoutes: 2,
        renderAfterTime: 3000, // Wait for React to render
        headless: true,
      },
      postProcess(renderedRoute) {
        // Add data-prerendered attribute to help identify pre-rendered pages
        renderedRoute.html = renderedRoute.html.replace(
          '<div id="root">',
          '<div id="root" data-prerendered="true">'
        )
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
})
