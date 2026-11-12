import { useEffect, useRef, useState } from 'react';
import { CircleQuestionMark } from 'lucide-react';
import { Button, Popover } from '../../index';
import styles from './AjudaDoCampo.module.css';

export interface AjudaDoCampoProps {
  /** Título curto da dica (também é o nome acessível do painel). */
  titulo: string;
  /** Parágrafos da dica. */
  texto: string[];
  /** Nome acessível do botão de ajuda, por exemplo "Ajuda: Quantos aluguéis de multa?". */
  rotuloDoBotao: string;
}

/** Tempo que a dica espera antes de fechar quando o mouse sai (deixa o mouse ir do ícone ao painel). */
const ATRASO_AO_SAIR = 150;

/**
 * Ícone de ajuda ao lado do rótulo de um campo (`labelAction`). Abre uma dica em painel flutuante (não é um modal):
 * ao passar o mouse, ao clicar ou tocar, e pelo teclado (Enter ou espaço). Fecha com Esc, ao clicar fora ou ao clicar de novo no ícone.
 * Compõe `Button` (ghost, só ícone) e `Popover`, que já cuida de portal, posição dentro da tela, Esc e clique fora.
 */
export function AjudaDoCampo({ titulo, texto, rotuloDoBotao }: AjudaDoCampoProps) {
  const botao = useRef<HTMLSpanElement>(null);
  const [aberto, setAberto] = useState(false);
  // fixado: aberto por clique, toque ou teclado (não fecha só porque o mouse saiu)
  const [fixado, setFixado] = useState(false);
  const espera = useRef<number>();

  const limpar = () => { window.clearTimeout(espera.current); };
  useEffect(() => limpar, []);

  const fechar = () => { limpar(); setAberto(false); setFixado(false); };
  const aoEntrar = () => { limpar(); setAberto(true); };
  const aoSair = () => { limpar(); if (!fixado) espera.current = window.setTimeout(() => setAberto(false), ATRASO_AO_SAIR); };
  const aoClicar = () => {
    limpar();
    // aberto só pelo mouse: o clique fixa a dica; se já está fixada, o clique fecha
    if (aberto && !fixado) { setFixado(true); return; }
    if (aberto) { fechar(); return; }
    setAberto(true); setFixado(true);
  };

  return (
    // os eventos do mouse também chegam pelo painel (que fica em um portal), então ir do ícone ao painel não fecha a dica
    <span ref={botao} className={styles.ajuda} onMouseEnter={aoEntrar} onMouseLeave={aoSair}>
      <Button
        variant="ghost" size="sm" iconOnly type="button"
        aria-label={rotuloDoBotao} aria-expanded={aberto} aria-haspopup="dialog"
        iconLeft={<CircleQuestionMark size={16} />}
        onClick={aoClicar}
      />
      <Popover open={aberto} onClose={fechar} anchorRef={botao} label={titulo} align="start">
        <div className={styles.conteudo}>
          <p className={styles.titulo}>{titulo}</p>
          {texto.map(t => <p key={t} className={styles.texto}>{t}</p>)}
        </div>
      </Popover>
    </span>
  );
}
