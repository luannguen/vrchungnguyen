import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Sử dụng dynamic import để tải lovable-tagger
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Load dynamically to avoid ESM/CommonJS conflict
  const lovableTagger = await import("lovable-tagger").catch(() => ({ componentTagger: () => ({}) }));
  const { componentTagger } = lovableTagger;

  return {
    base: "/", // Use absolute paths from root
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test-setup.js',
    },
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Cấu hình proxy cho các API request
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
    // Thêm thông báo khi khởi động server để xác nhận port và proxy
    hmr: {
      overlay: true,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    chunkSizeWarningLimit: 1500,
  },
}));
