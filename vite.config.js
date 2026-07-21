import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const apiUrl = process.env.VITE_API_URL || 'https://mopabot.duckdns.org';

  return defineConfig({
    plugins: [react()],
    server: {
      port: 6002, // standard user client port
      proxy: {
        '/api': apiUrl,
        '/uploads': apiUrl
      }
    }
  });
};
