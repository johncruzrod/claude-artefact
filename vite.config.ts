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
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More granular chunking based on file paths and modules
          if (id.includes('node_modules')) {
            // Split each major library into its own chunk
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('tone')) return 'vendor-tone';
            if (id.includes('d3')) return 'vendor-d3';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('@chakra-ui')) return 'vendor-chakra';
            if (id.includes('antd')) return 'vendor-antd';
            if (id.includes('react-bootstrap')) return 'vendor-bootstrap';
            if (id.includes('lodash')) return 'vendor-lodash';
            if (id.includes('mathjs')) return 'vendor-mathjs';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('@emotion')) return 'vendor-emotion';
            if (id.includes('styled-components')) return 'vendor-styled';
            if (id.includes('@babel/standalone')) return 'vendor-babel';
            if (id.includes('@codesandbox/sandpack')) return 'vendor-sandpack';
            if (id.includes('@twind')) return 'vendor-twind';
            
            // Group React Icons into smaller chunks by icon family
            if (id.includes('react-icons/fa')) return 'icons-fa';
            if (id.includes('react-icons/md')) return 'icons-md';
            if (id.includes('react-icons/hi')) return 'icons-hi';
            if (id.includes('react-icons/ai')) return 'icons-ai';
            if (id.includes('react-icons/bi')) return 'icons-bi';
            if (id.includes('react-icons/bs')) return 'icons-bs';
            if (id.includes('react-icons/fi')) return 'icons-fi';
            if (id.includes('react-icons/gi')) return 'icons-gi';
            if (id.includes('react-icons/go')) return 'icons-go';
            if (id.includes('react-icons/io')) return 'icons-io';
            if (id.includes('react-icons/ri')) return 'icons-ri';
            if (id.includes('react-icons/si')) return 'icons-si';
            if (id.includes('react-icons/ti')) return 'icons-ti';
            if (id.includes('react-icons')) return 'icons-other';
            
            // Group Radix UI components
            if (id.includes('@radix-ui')) return 'vendor-radix';
            
            // Core React ecosystem
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-redux')) return 'vendor-redux';
            if (id.includes('react-query')) return 'vendor-query';
            if (id.includes('react-hook-form')) return 'vendor-forms';
            if (id.includes('react') && !id.includes('react-')) return 'vendor-react';
            
            // Smaller utilities
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('clsx') || id.includes('classnames')) return 'vendor-utils';
            if (id.includes('axios')) return 'vendor-axios';
            if (id.includes('zustand')) return 'vendor-zustand';
            if (id.includes('formik') || id.includes('yup') || id.includes('zod')) return 'vendor-validation';
            
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
    // Enable minification for smaller files
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
