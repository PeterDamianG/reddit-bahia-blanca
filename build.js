#!/usr/bin/env bun
// build.js — Empaqueta y minifica los archivos fuente en un único dist/index.html
//
// Pipeline:
//   index.html + style.css + script.js + qr.svg → dist/index.html (auto-contenido)
//
// Uso:
//   bun build.js                    # produce dist/index.html minificado
//   bun build.js --no-minify        # produce dist/index.html legible (debug)
//
// Los archivos fuente quedan intactos para iteración fácil.

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  existsSync,
} from 'node:fs';

const noMinify = process.argv.includes('--no-minify');
const DIST = './dist';
if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

// ─── Lectura de fuentes ──────────────────────────────────────────
const html = readFileSync('./index.html', 'utf-8');
const css = readFileSync('./style.css', 'utf-8');
const js = readFileSync('./script.js', 'utf-8');
const qrSvg = readFileSync('./qr.svg', 'utf-8');

// ─── Minificación de CSS (regex-based, seguro para CSS hand-written) ──
function minifyCSS(s) {
  if (noMinify) return s;
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')                    // comentarios
    .replace(/\n+/g, '\n')                                // colapsar saltos
    .replace(/^\s+/gm, '')                                // sangrías
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')                 // espacios alrededor de operadores
    .replace(/;}/g, '}')                                  // ; redundante antes de }
    .replace(/\s\s+/g, ' ')                               // múltiples espacios
    .replace(/\n/g, '')                                   // saltos finales
    .trim();
}

// ─── Minificación de JS (Bun.build) ───────────────────────────────
async function minifyJS(code) {
  if (noMinify) return code;
  const result = await Bun.build({
    entrypoints: ['./script.js'],
    minify: true,
    target: 'browser',
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('Bun.build falló');
  }
  return await result.outputs[0].text();
}

// ─── Inline del QR SVG ────────────────────────────────────────────
function inlineSvg(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/, '')
    .replace(/<!DOCTYPE[^>]*>\s*/, '')
    .replace(/\n+/g, '')
    .trim();
}

// ─── Minificación de HTML (regex básico, seguro para nuestro markup) ──
function minifyHTML(s) {
  if (noMinify) return s;
  return s
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')              // comentarios HTML (preserva IE conditionals)
    .replace(/\n+/g, '\n')
    .replace(/^\s+/gm, '')
    .replace(/>\s+</g, '><')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Pipeline ─────────────────────────────────────────────────────
const minCss = minifyCSS(css);
const minJs = await minifyJS(js);
const inlinedSvg = inlineSvg(qrSvg);

// El SVG de QR debe llevar las dimensiones y la clase como el <img> original
const qrInline = inlinedSvg.replace(
  /<svg/,
  '<svg class="qr" width="130" height="130" aria-label="Código QR"'
);

let bundled = html
  .replace(
    /<link rel="stylesheet" href="style\.css"\s*\/?>/,
    `<style>${minCss}</style>`
  )
  .replace(
    /<script src="script\.js"[^>]*><\/script>/,
    `<script>${minJs}</script>`
  )
  .replace(
    /<img class="qr" src="qr\.svg"[^>]*\/?>/,
    qrInline
  );

bundled = minifyHTML(bundled);

// ─── Salida ───────────────────────────────────────────────────────
writeFileSync(`${DIST}/index.html`, bundled);
if (existsSync('./CNAME')) copyFileSync('./CNAME', `${DIST}/CNAME`);
writeFileSync(`${DIST}/.nojekyll`, '');

// ─── Reporte ──────────────────────────────────────────────────────
const sizeKB = (bundled.length / 1024).toFixed(2);
const totalSrc = html.length + css.length + js.length + qrSvg.length;
const reduction = (((totalSrc - bundled.length) / totalSrc) * 100).toFixed(1);

console.log(`✓ Built dist/index.html (${sizeKB} KB)`);
console.log(`  CSS:  ${css.length}\t→ ${minCss.length} bytes`);
console.log(`  JS:   ${js.length}\t→ ${minJs.length} bytes`);
console.log(`  SVG:  ${qrSvg.length}\t→ ${inlinedSvg.length} bytes`);
console.log(`  HTML: ${html.length}\t→ ${bundled.length} bytes (todo inline)`);
console.log(`  Total: ${totalSrc} → ${bundled.length} bytes (${reduction}% reducción)`);
