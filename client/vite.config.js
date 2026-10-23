import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, { bundle }) {
      if (!bundle) return html;
      let outputHtml = html;
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          const cssContent = chunk.source;
          outputHtml = outputHtml.replace(
            new RegExp(`<link[^>]*href=["'][^"']*${fileName}["'][^>]*>`),
            `<style>${cssContent}</style>`
          );
        }
      }
      return outputHtml;
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
});

