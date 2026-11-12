#!/usr/bin/env node
/**
 * Falha se algum CSS/TSX de componente ou de produto usar valores visuais fixos
 * em vez de tokens. Rode com:  npm run check:tokens
 *
 * Regras (em arquivos .css e .tsx/.ts, exceto src/tokens/ e *.stories.tsx):
 *  - cor literal: #hex, rgb(), rgba(), hsl(), hsla()
 *  - font-family que não use var(--font-*) nem inherit
 *  - font-size em px/rem/em literal
 *  - border-radius em px/rem literal (0, 50% e var() são permitidos)
 *
 * Regra de medidas PARES (só em src/pages/ e src/prototype/, o código do produto; a Base não entra):
 *  - todo valor literal em px, todo valor em rem que resulte em px, e todo `size={N}` de ícone precisam ser pares
 *    (ex.: 4, 8, 16, 24, 32; nunca 3, 5, 15). Espaços vêm dos tokens --spacing-*, que já são pares.
 *  - ficam de fora: linhas de @media/@container (breakpoints seguem o par 768/767 da Base), bordas de 1px
 *    (use --border-width-thin) e medidas relativas (%, fr, ch, em, razão de aspecto), que não são medidas fixas.
 *
 * Exceção pontual: adicione `/* token-ok *\/` (CSS) ou `// token-ok` (TSX) na mesma linha.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath decodifica %20 (a Base original quebra em caminhos com espaço, como "Legal design").
const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
const IGNORE_DIRS = [`${sep}tokens${sep}`];
const EVEN_SCOPE = [`${sep}pages${sep}`, `${sep}prototype${sep}`];

const rules = [
  { name: 'cor literal', re: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/ },
  { name: 'font-family fixa', re: /font-family\s*:\s*(?![\s]|var\(--font-|inherit)/ },
  { name: 'font-size literal', re: /font-size\s*:\s*[\d.]+(?:px|rem|em)\b/ },
  { name: 'border-radius literal', re: /border-radius\s*:\s*[\d.]+(?:px|rem)\b/ },
];

/** Medidas ímpares em px/rem e tamanhos de ícone ímpares. Retorna a descrição dos problemas da linha. */
function oddMeasures(line) {
  if (/@(media|container)\b/.test(line)) return [];
  const found = [];
  for (const m of line.matchAll(/(-?\d*\.?\d+)px\b/g)) {
    const n = parseFloat(m[1]);
    if (!Number.isInteger(n) || Math.abs(n) % 2 !== 0) found.push(m[0]);
  }
  for (const m of line.matchAll(/(-?\d*\.?\d+)rem\b/g)) {
    const px = parseFloat(m[1]) * 16;
    if (!Number.isInteger(px) || Math.abs(px) % 2 !== 0) found.push(`${m[0]} (= ${px}px)`);
  }
  for (const m of line.matchAll(/\bsize=\{(\d+)\}/g)) {
    if (Number(m[1]) % 2 !== 0) found.push(`size={${m[1]}}`);
  }
  return found;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT).filter(f =>
  /\.(css|tsx?)$/.test(f) &&
  !f.endsWith('.stories.tsx') &&
  !f.endsWith('.d.ts') &&
  !IGNORE_DIRS.some(d => f.includes(d)),
);

let problems = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('token-ok')) return;
    if (EVEN_SCOPE.some(d => file.includes(d))) {
      const odd = oddMeasures(line);
      if (odd.length) {
        problems++;
        console.error(`${relative(ROOT, file)}:${i + 1}  medida ímpar (${odd.join(', ')})  →  ${line.trim()}`);
      }
    }
    for (const rule of rules) {
      if (rule.re.test(line)) {
        problems++;
        console.error(`${relative(ROOT, file)}:${i + 1}  ${rule.name}  →  ${line.trim()}`);
      }
    }
  });
}

if (problems > 0) {
  console.error(`\n✖ ${problems} problema(s). Use tokens de src/tokens/tokens.css e medidas pares (veja TOKENS.md e AGENTS.md).`);
  process.exit(1);
}
console.log(`✔ Nenhum valor visual fixo nem medida ímpar em ${files.length} arquivos.`);
