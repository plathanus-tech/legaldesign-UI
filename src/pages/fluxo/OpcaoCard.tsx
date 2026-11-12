import { ReactNode, useId } from 'react';
import { CircleX } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './OpcaoCard.module.css';

export interface OpcaoCardProps {
  /** Nome do grupo de rádios (agrupa as opções). */
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  /** Ícone da opção (decorativo). */
  icone: ReactNode;
  titulo: string;
  /** Frase curta que explica a opção em linguagem simples. */
  descricao?: string;
}

/**
 * Opção de escolha única em formato de card, com ícone, título e explicação. É um rádio de verdade (teclado, leitor de
 * tela e foco nativos); o card inteiro é a área de clique. Candidato a componente da Base (`ChoiceCard`).
 */
export function OpcaoCard({ name, value, checked, onChange, icone, titulo, descricao }: OpcaoCardProps) {
  return (
    <label className={cx(styles.card, checked && styles.checked)}>
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className={styles.icon} aria-hidden="true">{icone}</span>
      <span className={styles.text}>
        <span className={styles.titulo}>{titulo}</span>
        {descricao && <span className={styles.desc}>{descricao.replace(/\.$/, '')}</span>}
      </span>
      <span className={styles.mark} aria-hidden="true"></span>
    </label>
  );
}

export interface GrupoOpcoesProps {
  /** Pergunta do grupo (vira a legenda do `fieldset`). */
  legenda: string;
  /** Explicação curta, em linguagem simples, sob a pergunta. */
  ajuda?: string;
  /** Quantas opções por linha em telas largas. */
  colunas?: 2 | 3;
  /** Opções de texto curto: ficam lado a lado já em telas pequenas. */
  curtas?: boolean;
  /** Mensagem de erro de preenchimento (obrigatoriedade). Deixa a borda dos cards vermelha e mostra a ajuda abaixo. */
  erro?: string;
  children: ReactNode;
}

/** Grupo de `OpcaoCard`: `fieldset` com a pergunta, uma explicação opcional e as opções em grade. */
export function GrupoOpcoes({ legenda, ajuda, colunas = 2, curtas, erro, children }: GrupoOpcoesProps) {
  const id = useId();
  const ajudaId = `${id}-ajuda`;
  const erroId = `${id}-erro`;
  const descrito = [ajuda ? ajudaId : '', erro ? erroId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset className={cx(styles.grupo, !ajuda && styles.semAjuda)} data-erro={erro ? 'true' : undefined} aria-describedby={descrito}>
      <legend className={styles.legenda}>{legenda}</legend>
      {ajuda && <p id={ajudaId} className={styles.ajuda}>{ajuda}</p>}
      <div className={cx(styles.grade, colunas === 3 && styles.tres, curtas && styles.duas)}>{children}</div>
      {erro && (
        <p id={erroId} className={styles.erro} aria-live="polite">
          <CircleX size={14} className={styles.erroIcone} aria-hidden="true" />
          {erro}
        </p>
      )}
    </fieldset>
  );
}
