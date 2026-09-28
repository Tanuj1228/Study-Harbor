import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path for deployment if needed, but for now, keep it simple.
  // server: {
  //   port: 5173
  // }
});