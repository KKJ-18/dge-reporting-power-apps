import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: true,
    port: 5173,
  },
  plugins: [react(), splitVendorChunkPlugin()],
  resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
  },  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('@microsoft/power-apps') || id.includes('@pa-client/power-code-sdk')) return 'power-sdk';
            return 'vendor';
          }

          if (/[\\/]src[\\/]components[\\/]forms[\\/]/.test(id)) return 'forms';
          if (/[\\/]src[\\/]components[\\/](DepartmentDashboard|CategoryActivitiesPage|DashboardModern)/.test(id)) return 'dashboards';
          if (/[\\/]src[\\/]services[\\/]/.test(id)) return 'services';

          return undefined;
        }
      }
    }
  }
});