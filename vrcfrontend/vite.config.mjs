// vite.config.mjs - Sử dụng định dạng .mjs để đảm bảo ESM được nhận dạng đúng
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Tạo mock function cho componentTagger để tránh import trực tiếp
const mockComponentTagger = () => ({});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Sử dụng mock function thay vì import trực tiếp
  const componentTagger = mockComponentTagger;
  
  return {
    base: "/", // Use absolute paths from root
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test-setup.js',
    },
    server: {
      host: "::",
      port: 8081, // Đổi sang port 8081 để phù hợp với cấu hình Cypress
      proxy: {
        // Cấu hình proxy cho các API request
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: true,
      },
    },
    plugins: [
      react(),
      // Chỉ sử dụng componentTagger trong môi trường development khi cần
      // mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      minify: true,
      chunkSizeWarningLimit: 1500,
    },
  };
});
