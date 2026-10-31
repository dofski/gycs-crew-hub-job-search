import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '#react-pdf-renderer', replacement: path.resolve(__dirname, 'packages/pdf/src/forme/primitives.tsx') },
        { find: '@reactive-resume/fonts', replacement: path.resolve(__dirname, 'packages/fonts/src/index.ts') },
        { find: '@reactive-resume/docx', replacement: path.resolve(__dirname, 'packages/docx/src/index.ts') },
        { find: '@reactive-resume/pdf/icons', replacement: path.resolve(__dirname, 'packages/pdf/src/forme/phosphor-icons/all.ts') },
        { find: '@reactive-resume/pdf/browser', replacement: path.resolve(__dirname, 'packages/pdf/src/browser.tsx') },
        { find: '@reactive-resume/pdf/page-map', replacement: path.resolve(__dirname, 'packages/pdf/src/page-map.ts') },
        { find: '@reactive-resume/pdf/semantic-legacy', replacement: path.resolve(__dirname, 'packages/pdf/src/semantic/legacy-converter.ts') },
        { find: '@reactive-resume/pdf/semantic-tree', replacement: path.resolve(__dirname, 'packages/pdf/src/semantic/tree.ts') },
        { find: '@reactive-resume/pdf/filtering', replacement: path.resolve(__dirname, 'packages/pdf/src/templates/shared/filtering.ts') },
        { find: '@reactive-resume/pdf/section-title', replacement: path.resolve(__dirname, 'packages/pdf/src/section-title.ts') },
        { find: '@reactive-resume/pdf/web-page', replacement: path.resolve(__dirname, 'packages/pdf/src/html/web-page.tsx') },
        { find: '@reactive-resume/pdf/web-page-card', replacement: path.resolve(__dirname, 'packages/pdf/src/html/card.ts') },
        { find: '@reactive-resume/pdf/web-page-document', replacement: path.resolve(__dirname, 'packages/pdf/src/html/document.ts') },
        { find: '@reactive-resume/pdf/web-page-messages', replacement: path.resolve(__dirname, 'packages/pdf/src/html/messages.ts') },
        { find: '@reactive-resume/resume/ats', replacement: path.resolve(__dirname, 'packages/resume/src/ats/index.ts') },
        { find: '@reactive-resume/resume/ats-pdf', replacement: path.resolve(__dirname, 'packages/resume/src/ats-pdf/index.ts') },
        { find: '@reactive-resume/resume/stylesheet/registry', replacement: path.resolve(__dirname, 'packages/resume/src/stylesheet/registry/index.ts') },
        { find: '@reactive-resume/resume/stylesheet/types', replacement: path.resolve(__dirname, 'packages/resume/src/stylesheet/semantic-types.ts') },
        { find: '@reactive-resume/resume/stylesheet', replacement: path.resolve(__dirname, 'packages/resume/src/stylesheet/index.ts') },
        { find: /^@reactive-resume\/resume\/(.*)$/, replacement: path.resolve(__dirname, 'packages/resume/src/$1') },
        { find: /^@reactive-resume\/schema\/(.*)$/, replacement: path.resolve(__dirname, 'packages/schema/src/$1') },
        { find: /^@reactive-resume\/utils\/(.*)$/, replacement: path.resolve(__dirname, 'packages/utils/src/$1') },
        { find: /^@reactive-resume\/import\/(.*)$/, replacement: path.resolve(__dirname, 'packages/import/src/$1') },
        { find: '@', replacement: path.resolve(__dirname, '.') },
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
