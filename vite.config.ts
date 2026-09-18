import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// The whole stylesheet is small (~8 KB) and every page needs it, so shipping it
// inside the HTML removes a render-blocking request on the critical path.
export function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset' || !file.fileName.endsWith('.html')) continue;
        let html = file.source as string;
        html = html.replace(
          /<link rel="stylesheet"[^>]*href="\/?([^"]+\.css)"[^>]*>/g,
          (tag, href: string) => {
            const css = bundle[href.replace(/^\//, '')];
            if (!css || css.type !== 'asset') return tag;
            return `<style>${css.source}</style>`;
          }
        );
        file.source = html;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), inlineCss()],
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: isSsrBuild
      ? {}
      : {
          // 404.html is a separate entry: Vercel serves it (with a 404 status)
          // for any path that doesn't match a file.
          input: {
            main: fileURLToPath(new URL('./index.html', import.meta.url)),
            notFound: fileURLToPath(new URL('./404.html', import.meta.url)),
          },
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              lucide: ['lucide-react'],
            },
          },
        },
  },
}));
