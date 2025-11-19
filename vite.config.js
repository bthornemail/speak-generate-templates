import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/autocomplete',
      '@codemirror/lint',
      '@codemirror/lang-markdown',
      '@codemirror/theme-one-dark',
      '@lezer/highlight',
      '@lezer/lr'
    ]
  },
  optimizeDeps: {
    include: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/autocomplete',
      '@codemirror/lint',
      '@codemirror/lang-markdown',
      '@codemirror/theme-one-dark',
      '@lezer/highlight',
      '@lezer/lr',
      '@uiw/react-codemirror'
    ],
    force: true // Force re-optimization
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: (id) => {
        // Externalize meta-log-db as optional dependency
        if (id === 'meta-log-db/browser' || id.startsWith('meta-log-db/')) {
          return true;
        }
        return false;
      },
      output: {
        globals: {
          'meta-log-db/browser': 'MetaLogDb'
        }
      }
    }
  }
})
