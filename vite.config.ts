import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // PENTING: Membuat path asset (JS/CSS) relatif, sehingga bisa dijalankan di shared hosting atau subfolder.
  build: {
    outDir: 'dist',
  }
});