import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo (development, production)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Asegurar que las variables de entorno estén disponibles
      __VITE_GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY || ""),
    },
    server: {
      // Configuración para Codespaces
      host: '0.0.0.0',
      port: 3000,
      // Configuración segura para las API Keys
      hmr: {
        clientPort: 443,
      },
    },
  };
});
