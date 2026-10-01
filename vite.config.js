import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vite only exposes VITE_* vars to client code by default. Adding 'GEMINI_' lets
  // geminiService.js read GEMINI_API_KEY / GEMINI_MODEL from .env as-is.
  // NOTE: anything exposed this way ends up in the browser bundle.
  envPrefix: ['VITE_', 'GEMINI_'],
});
