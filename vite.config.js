import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  optimizeDeps: {
<<<<<<< HEAD
    include: ['@supabase/supabase-js'],
  },
  build: {
    rollupOptions: {
      external: [],
=======
    include: ['@supabase/supabase-js'], // pre-bundle Supabase
  },
  build: {
    rollupOptions: {
      external: [], // bundle everything, don’t treat any module as external
>>>>>>> 491f80ccb812713c2bd2cdb8c1f3615c5ecfda76
    },
  },
});
