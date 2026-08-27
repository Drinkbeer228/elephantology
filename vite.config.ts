import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/elephantology/', // Имя репозитория со слэшами с двух сторон
});
