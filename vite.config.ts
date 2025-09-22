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
        manualChunks: (id) => {
      // Ultra-aggressive chunking to keep files under 25MB
        if (id.includes('node_modules')) {
          // Split each major library into its own chunk
            if (id.includes('tone')) return 'vendor-tone';
            if (id.includes('d3')) return 'vendor-d3';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('@chakra-ui')) return 'vendor-chakra';
            if (id.includes('antd')) return 'vendor-antd';
            if (id.includes('react-bootstrap')) return 'vendor-bootstrap';
            if (id.includes('lodash')) return 'vendor-lodash';
            if (id.includes('framer-motion')) return 'vendor-framer';
            // Keep Emotion in the same chunk as core React to avoid TDZ/cycle issues
            // seen when minified across separate chunks.
            if (id.includes('@emotion')) return 'vendor-react-core';
            if (id.includes('styled-components')) return 'vendor-styled';
            if (id.includes('@twind')) return 'vendor-twind';
            
            // Split Babel standalone into smaller chunks if possible
            if (id.includes('@babel/standalone')) {
              // Try to split babel by internal modules
              if (id.includes('parser')) return 'babel-parser';
              if (id.includes('generator')) return 'babel-generator';
              if (id.includes('traverse')) return 'babel-traverse';
              if (id.includes('types')) return 'babel-types';
              if (id.includes('template')) return 'babel-template';
              if (id.includes('preset')) return 'babel-presets';
              if (id.includes('plugin')) return 'babel-plugins';
              return 'babel-core';
            }
            
            if (id.includes('@codesandbox/sandpack')) return 'vendor-sandpack';
            
            // React Icons removed - using Lucide React instead (5,295+ icons)
            
            // Group Radix UI components
            if (id.includes('@radix-ui')) return 'vendor-radix';
            
            // Core React ecosystem - Keep React and React-DOM together for React 19 compatibility
            if (id.includes('react-dom') || (id.includes('react') && !id.includes('react-'))) {
              return 'vendor-react-core';
            }
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-redux')) return 'vendor-redux';
            if (id.includes('react-query')) return 'vendor-query';
            // Split form libraries separately to avoid circular dependencies
            if (id.includes('react-hook-form')) return 'vendor-react-hook-form';
            if (id.includes('@hookform/resolvers')) return 'vendor-hookform-resolvers';
            if (id.includes('formik')) return 'vendor-formik';
            if (id.includes('yup')) return 'vendor-yup';
            if (id.includes('zod')) return 'vendor-zod';
            
            // Smaller utilities
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('clsx') || id.includes('classnames')) return 'vendor-utils';
            if (id.includes('axios')) return 'vendor-axios';
            if (id.includes('zustand')) return 'vendor-zustand';
            
            // Default vendor chunk for remaining libraries
            return 'vendor';
          }
          
          // Split app code by features/routes if it gets large
          if (id.includes('/components/ui/')) return 'ui-components';
          if (id.includes('/lib/')) return 'lib';
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
