// Abre o protótipo (o Navegador de Protótipo) como um card separado do Storybook.
// Sobe uma página mínima na porta 6009 que espera o Storybook (porta 6008) ficar pronto e então vai para o navegador de protótipo.
// Se o Storybook ainda não estiver no ar, este script também o inicia. Se já estiver (card "storybook-legal-design"), só reaproveita.
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const PORTA_SITE = 6009;
const PORTA_STORYBOOK = 6008;
const DESTINO = `http://localhost:${PORTA_STORYBOOK}/iframe.html?id=${encodeURIComponent('protótipo-navegador-de-protótipo--navegador')}&viewMode=story`;

const portaAberta = porta => new Promise(resolve => {
  const s = net.connect({ port: porta, host: '127.0.0.1' }, () => { s.destroy(); resolve(true); });
  s.on('error', () => resolve(false));
});

let filho = null;
if (!(await portaAberta(PORTA_STORYBOOK))) {
  filho = spawn('npm', ['run', 'storybook', '--', '-p', String(PORTA_STORYBOOK), '--no-open'], { shell: true, stdio: 'ignore', windowsHide: true, cwd: fileURLToPath(new URL('..', import.meta.url)) });
  console.log(`Iniciando o Storybook na porta ${PORTA_STORYBOOK}…`);
} else {
  console.log(`Storybook já está na porta ${PORTA_STORYBOOK}: reaproveitando.`);
}

const encerrar = () => {
  if (filho?.pid) {
    try { if (process.platform === 'win32') execSync(`taskkill /pid ${filho.pid} /T /F`, { stdio: 'ignore' }); else process.kill(-filho.pid); } catch { /* já encerrou */ }
  }
  process.exit(0);
};
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
process.on('exit', () => { if (filho?.pid && process.platform === 'win32') { try { execSync(`taskkill /pid ${filho.pid} /T /F`, { stdio: 'ignore' }); } catch { /* já encerrou */ } } });

const pagina = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Protótipo</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px system-ui,sans-serif;background:#fafaf9;color:#292524;text-align:center}p{max-width:24rem;line-height:1.5;margin:.5rem 1rem}small{color:#78716c}</style></head>
<body><main><p><strong>Abrindo o protótipo…</strong></p><p><small>Aguardando o Storybook ficar pronto. Pode levar de 20 a 30 segundos.</small></p></main>
<script>
const destino = ${JSON.stringify(DESTINO)};
const tentar = () => fetch('http://localhost:${PORTA_STORYBOOK}/index.json', { mode: 'no-cors' }).then(() => setTimeout(() => location.replace(destino), 1500)).catch(() => setTimeout(tentar, 1500));
tentar();
</script></body></html>`;

http.createServer((_req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(pagina); }).listen(PORTA_SITE, () => console.log(`Protótipo em http://localhost:${PORTA_SITE}`));
