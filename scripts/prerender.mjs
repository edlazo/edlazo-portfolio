// Injects the prerendered markup into dist/index.html after the client build.
// Without it the browser has to download and run React before anything paints.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
const entry = path.join(root, 'dist-ssr', 'entry-server.js');
const page = path.join(root, 'dist', 'index.html');

const { render } = await import(pathToFileURL(entry).href);
const html = render();

const source = fs.readFileSync(page, 'utf8');
if (!source.includes('<div id="root"></div>')) {
  throw new Error('no encontré <div id="root"></div> en dist/index.html');
}
fs.writeFileSync(page, source.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
console.log(`prerender: ${(html.length / 1024).toFixed(1)} KB de HTML inyectados en dist/index.html`);
