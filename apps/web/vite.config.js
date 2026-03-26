import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],

  // Inject environment variables at build time
  // Reads from .env / .env.local files automatically
  define: {
    'window.SVU_ENV': JSON.stringify({
      SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
    }),
  },

  // Multi-page app configuration
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        register: './register.html',
        dashboard: './dashboard.html',
        groups: './groups.html',
        materials: './materials.html',
        courses: './courses.html',
        admin: './admin.html',
        'reset-password': './reset-password.html',
        'verify-email': './verify-email.html',
        schedule: './schedule.html',
        profile: './profile.html',
      },
    },
    // Use esbuild for minification (built-in, no extra deps)
    minify: 'esbuild',
    // Disable source maps for production
    sourcemap: false,
    // Asset optimization
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
  },

  // Dev server
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
  },
});
