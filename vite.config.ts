import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = process.env.GITHUB_PAGES === 'true' && repoName ? `/${repoName}/` : '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0'
    },
    build: {
      target: 'es2019'
    }
  };
});
