import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import prerender from '@prerenderer/rollup-plugin'
import path from 'path'

// Routes to pre-render for SEO
// Pre-render main pages and category pages for better initial SEO
const PRERENDER_ROUTES = [
  '/',
  '/timeline',
  '/ai',
  '/startups',
  '/dev',
  '/product',
  '/research',
  '/about',
  '/timeline/companies',
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
    // Pre-render pages for SEO - always enabled in production builds
    // Disable only in dev mode or when DISABLE_PRERENDER=true
    process.env.NODE_ENV !== 'development' && process.env.DISABLE_PRERENDER !== 'true' && prerender({
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
