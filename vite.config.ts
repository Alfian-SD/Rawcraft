import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createEngineMiddleware } from './server/engine.mjs';

function rawcraftEnginePlugin(): Plugin {
  return {
    name: 'rawcraft-engine-backend',
    configureServer(server) {
      server.middlewares.use(createEngineMiddleware());
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), rawcraftEnginePlugin()],
});
