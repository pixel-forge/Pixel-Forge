import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const playgroundDir = fileURLToPath(new URL('.', import.meta.url));
const packageDir = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  root: playgroundDir,
  server: {
    fs: {
      allow: [packageDir],
    },
  },
});
