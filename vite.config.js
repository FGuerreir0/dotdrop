import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Disable source maps in production
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
        // Generate minified file names with hashes
        entryFileNames: 'assets/[name].[hash].min.js',
        chunkFileNames: 'assets/[name].[hash].min.js',
        assetFileNames: 'assets/[name].[hash].min.[ext]',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Production optimizations
  esbuild: {
    drop: ['console', 'debugger'], // Remove console and debugger in production
  },
})
