import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, ExternalLink, GitBranch, MessageSquareCode, Monitor, Route, Search, Smartphone, Tablet, X,
} from 'lucide-react';
import { cx } from '../utils/cx';
import { journeys, type FlowNode, type ScreenNode } from './config';
import { notasDev } from './notas';
import { marcadoresDaTela, mostrarNotasNoQuadro, notasDaTela } from './notasNoQuadro';
import styles from './PrototypeNav.module.css';

type Device = 'desktop' | 'tablet' | 'mobile';
interface Entry { id: string; label: string; storyId?: string; trail: string; groups: string[] }

const STORAGE_KEY = 'legal-design.protoNav.state.v1';
const isFlow = (n: ScreenNode | FlowNode): n is FlowNode => 'type' in n && n.type === 'flow';

const DEVICES: Array<{ id: Device; label: string; icon: ReactNode }> = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor size={14} aria-hidden="true" /> },
  { id: 'tablet', label: 'Tablet', icon: <Tablet size={14} aria-hidden="true" /> },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone size={14} aria-hidden="true" /> },
];

/** Achata a config em uma lista de telas/variantes navegáveis. */
function flatten(): Entry[] {
  const out: Entry[] = [];
  const addScreen = (s: ScreenNode, trail: string, groups: string[]) => {
    out.push({ id: s.id, label: s.label, storyId: s.storyId, trail, groups });
    s.variants?.forEach(v => out.push({ id: v.id, label: v.label, storyId: v.storyId, trail: `${trail} / ${s.label}`, groups: [...groups, `v:${s.id}`] }));
  };
  journeys.forEach(j => j.items.forEach(n => {
    if (isFlow(n)) n.screens.forEach(s => addScreen(s, `${j.label} / ${n.label}`, [j.id, n.id]));
    else addScreen(n, j.label, [j.id]);
  }));
  return out;
}

function load(): { open: string[]; collapsed: boolean; device: Device } {
  const base = { open: [] as string[], collapsed: false, device: 'desktop' as Device };
  try { return { ...base, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }; }
  catch { return base; }
}

/** URL da story renderizada sozinha (sem o chrome do Storybook), relativa ao iframe.html atual. */
const frameUrl = (storyId?: string) => (storyId ? `iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story` : '');

/**
 * Navegador de Protótipo: ferramenta de apoio FORA da interface final (mesmo padrão da Maglev).
 * Sidebar com a árvore de telas e variantes, seletor de dispositivo e a tela aberta em um quadro.
 * Telas ainda não desenhadas aparecem como "Em breve".
 */
export function PrototypeNav() {
  const entries = useMemo(flatten, []);
  const saved = useMemo(load, []);
  const firstReady = entries.find(e => e.storyId);
  const [device, setDevice] = useState<Device>(saved.device);
  const [collapsed, setCollapsed] = useState(saved.collapsed);
  const [open, setOpen] = useState<string[]>(
    saved.open.length ? saved.open : journeys.flatMap(j => [j.id, ...j.items.filter(isFlow).map(f => f.id)]),
  );
  const [query, setQuery] = useState('');
  const [currentId, setCurrentId] = useState(firstReady?.id ?? '');

  const current = entries.find(e => e.id === currentId);
  const src = frameUrl(current?.storyId);

  // Notas para desenvolvimento: começam escondidas (a visualização padrão é a do produto, sem comentários) e valem para qualquer tela aberta
  const [verNotas, setVerNotas] = useState(false);
  const [notaAberta, setNotaAberta] = useState<string | null>(null);
  const [quadroCarregado, setQuadroCarregado] = useState(0);
  const quadro = useRef<HTMLIFrameElement>(null);
  const marcadores = useMemo(() => marcadoresDaTela(current?.storyId, notasDev), [current?.storyId]);
  const notasDestaTela = useMemo(() => notasDaTela(marcadores), [marcadores]);
  const notaAtual = notasDestaTela.find(n => n.id === notaAberta);

  useEffect(() => {
    if (!verNotas || !quadro.current) return;
    return mostrarNotasNoQuadro(quadro.current, marcadores, setNotaAberta);
  }, [verNotas, marcadores, quadroCarregado, device]);
  // ao desligar as notas, ou ao trocar de tela sem a nota aberta, o comentário some
  useEffect(() => { if (!verNotas || !notasDestaTela.some(n => n.id === notaAberta)) setNotaAberta(null); }, [verNotas, notasDestaTela, notaAberta]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ open, collapsed, device })); } catch { /* sem storage */ }
  }, [open, collapsed, device]);

  // Uma tela do protótipo pode pedir para abrir outra (ex.: o botão da página inicial leva ao formulário).
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin || ev.data?.source !== 'prototype-nav') return;
      const hit = entries.find(e => e.storyId === ev.data.storyId);
      if (hit) setCurrentId(hit.id);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [entries]);

  // Expande a árvore até o item ativo.
  useEffect(() => {
    const groups = entries.find(e => e.id === currentId)?.groups ?? [];
    setOpen(o => (groups.every(g => o.includes(g)) ? o : [...new Set([...o, ...groups])]));
  }, [currentId, entries]);

  const toggle = (id: string) => setOpen(o => (o.includes(id) ? o.filter(x => x !== id) : [...o, id]));
  const matches = (label: string) => !query.trim() || label.toLowerCase().includes(query.trim().toLowerCase());

  const item = (id: string, label: string, variant = false, extra?: ReactNode) => {
    const e = entries.find(x => x.id === id)!;
    if (!matches(label)) return null;
    const ready = !!e.storyId;
    return (
      <div key={id} className={cx(styles.item, variant && styles.itemVariant, currentId === id && styles.itemActive, !ready && styles.itemSoon)}>
        <button
          type="button"
          className={styles.itemLabel}
          disabled={!ready}
          aria-current={currentId === id ? 'page' : undefined}
          onClick={() => setCurrentId(id)}
        >
          {label}
        </button>
        {!ready && <span className={styles.soon}>Em breve</span>}
        {extra}
      </div>
    );
  };

  const screen = (s: ScreenNode) => {
    const hasVariants = !!s.variants?.length;
    const key = `v:${s.id}`;
    const expanded = open.includes(key);
    return (
      <div key={s.id}>
        {item(s.id, s.label, false, hasVariants && (
          <button
            type="button"
            className={styles.variantToggle}
            aria-expanded={expanded}
            aria-label={`Variantes de ${s.label}`}
            onClick={() => toggle(key)}
          >
            <ChevronRight size={14} aria-hidden="true" className={cx(styles.chevron, expanded && styles.chevronOpen)} />
          </button>
        ))}
        {hasVariants && expanded && <div className={styles.variants}>{s.variants!.map(v => item(v.id, v.label, true))}</div>}
      </div>
    );
  };

  const group = (id: string, label: string, icon: ReactNode, children: ReactNode, flow: boolean) => (
    <div key={id} className={flow ? styles.flow : styles.journey}>
      <button type="button" className={styles.groupHeader} aria-expanded={open.includes(id)} onClick={() => toggle(id)}>
        <ChevronRight size={12} aria-hidden="true" className={cx(styles.chevron, open.includes(id) && styles.chevronOpen)} />
        {icon}
        <span>{label}</span>
      </button>
      {open.includes(id) && <div className={flow ? styles.flowBody : styles.groupBody}>{children}</div>}
    </div>
  );

  return (
    <div className={cx(styles.root, collapsed && styles.collapsed)}>
      <aside className={styles.sidebar} id="pn-sidebar" aria-hidden={collapsed || undefined}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <Route size={16} aria-hidden="true" />
            <span>Navegador de Protótipo</span>
          </div>

          <div className={styles.deviceSwitch} role="group" aria-label="Alternar dispositivo">
            {DEVICES.map(d => (
              <button
                key={d.id}
                type="button"
                className={cx(styles.deviceBtn, device === d.id && styles.deviceBtnActive)}
                aria-pressed={device === d.id}
                onClick={() => setDevice(d.id)}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>

          <label className={styles.search}>
            <Search size={14} aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar tela..."
              autoComplete="off"
              aria-label="Buscar tela"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
        </div>

        <nav className={styles.tree} aria-label="Telas do protótipo">
          {journeys.map(j => group(j.id, j.label, <Route size={14} aria-hidden="true" />, j.items.map(n =>
            isFlow(n)
              ? group(n.id, n.label, <GitBranch size={14} aria-hidden="true" />, n.screens.map(screen), true)
              : screen(n)), false))}
        </nav>
      </aside>

      <button
        type="button"
        className={styles.sidebarToggle}
        aria-controls="pn-sidebar"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expandir navegador' : 'Recolher navegador'}
        onClick={() => setCollapsed(c => !c)}
      >
        {collapsed ? <ChevronRight size={14} aria-hidden="true" /> : <ChevronLeft size={14} aria-hidden="true" />}
      </button>

      <main className={styles.viewport}>
        <div className={styles.topbar}>
          <span className={styles.current}>{current ? `${current.trail} / ${current.label}` : '-'}</span>
          <div className={styles.notasSwitch} role="group" aria-label="Notas para desenvolvimento">
            <button type="button" className={cx(styles.notasBtn, !verNotas && styles.notasBtnActive)} aria-pressed={!verNotas} onClick={() => setVerNotas(false)}>Ocultar notas</button>
            <button type="button" className={cx(styles.notasBtn, verNotas && styles.notasBtnActive)} aria-pressed={verNotas} onClick={() => setVerNotas(true)}>
              <MessageSquareCode size={14} aria-hidden="true" /> Ver notas{verNotas && notasDestaTela.length > 0 ? ` (${notasDestaTela.length})` : ''}
            </button>
          </div>
          {src && (
            <a className={styles.openRaw} href={src} target="_blank" rel="noopener noreferrer">
              Abrir em nova aba <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}
        </div>
        <div className={styles.frameWrap} data-device={device}>
          {src
            ? <iframe key={`${src}-${device}`} ref={quadro} className={styles.frame} title="Prévia da tela" src={src} onLoad={() => setQuadroCarregado(n => n + 1)} />
            : <p className={styles.empty}>Escolha uma tela no menu.</p>}
        </div>
        {verNotas && notaAtual && (
          <aside className={styles.nota} role="region" aria-label="Nota para desenvolvimento">
            <div className={styles.notaTopo}>
              <span className={styles.notaTag}><MessageSquareCode size={12} aria-hidden="true" /> Nota para desenvolvimento</span>
              <button type="button" className={styles.notaFechar} aria-label="Fechar nota" onClick={() => setNotaAberta(null)}><X size={14} aria-hidden="true" /></button>
            </div>
            <h2 className={styles.notaTitulo}>{notaAtual.titulo}</h2>
            <p className={styles.notaTexto}>{notaAtual.texto}</p>
            <p className={styles.notaAviso}>Esta observação não aparece para quem usa o produto.</p>
            {notasDestaTela.length > 1 && (
              <div className={styles.notaOutras} role="group" aria-label="Outras notas desta tela">
                {notasDestaTela.filter(n => n.id !== notaAtual.id).map(n => <button key={n.id} type="button" onClick={() => setNotaAberta(n.id)}>{n.titulo}</button>)}
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
}
