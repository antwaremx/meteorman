import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  optimizeDeps: {
    // These aliases resolve to Vite `?worker` modules. Pre-bundling them in
    // development strips Vite's synthetic default Worker constructor.
    exclude: ['monaco-editor-worker', 'monaco-json-worker']
  },
  resolve: {
    alias: {
      'monaco-editor-worker': path.join(
        projectRoot,
        'node_modules/monaco-editor/esm/vs/editor/editor.worker.js'
      ) + '?worker',
      'monaco-json-worker': path.join(
        projectRoot,
        'node_modules/monaco-editor/esm/vs/language/json/json.worker.js'
      ) + '?worker'
    }
  },
  build: {
    sourcemap: true
  }
});
