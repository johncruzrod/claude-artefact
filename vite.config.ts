import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components': '/components',
      '@/lib': '/lib'
    }
  },
  optimizeDeps: {
    include: [
      '@twind/core',
      '@twind/preset-tailwind',
      '@twind/preset-autoprefix',
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
    ],
    exclude: [
      // Prevent React internals from being pre-bundled incorrectly
      'react/jsx-dev-runtime'
    ]
  },
  build: {
    rollupOptions: {
      // Ensure React internals are handled correctly
      external: () => {
        // Don't externalize anything - we want everything bundled
        return false;
      },
      output: {
        // Root fix: avoid cross-chunk initialization order bugs by collapsing
        // all third-party deps into a single vendor chunk. Let app code split
        // naturally. This sacrifices some granularity for robust runtime init.
        manualChunks: (id) => {
          if (id.includes('node_modules')) return 'vendor';
        },
        // Keep chunk file names shorter
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    },
    // Disable source maps to reduce file sizes
    sourcemap: false,
    // Increase chunk size warning limit but keep it reasonable
    chunkSizeWarningLimit: 2000,
    // Prefer esbuild minification to avoid rare TDZ/mangling issues with certain
    // libraries when split across manual chunks (e.g., Emotion).
    minify: 'esbuild'
  }
})
