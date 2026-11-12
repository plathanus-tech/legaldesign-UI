import { ReactNode, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { AppHeader, Button, Dialog } from '../../index';
import { cx } from '../../utils/cx';
import { ResumoArvore, type ResumoGrupo } from './ResumoArvore';
import { StepperFluxo } from './StepperFluxo';
import styles from './FluxoShell.module.css';


export interface FluxoShellProps {
  /** Nome do modelo mostrado no cabeçalho (ex.: "Contrato de locação de imóvel"). */
  modelo: string;
  /** Etapa macro atual: 0 Preencher · 1 Revisar · 2 Pagar · 3 Baixar PDF. */
  etapa: 0 | 1 | 2 | 3;
  /** Página atual dentro da etapa (a partir de 1). Os nomes e a quantidade de páginas de cada etapa vêm de `etapas.ts`. Sem ele, o stepper interno não aparece. `total` é opcional e não é mais usado. */
  pagina?: { atual: number; total?: number };
  /** Resumo em árvore do que já foi escolhido. */
  resumo: ResumoGrupo[];
  /** Sair do preenchimento (volta à página inicial). */
  onSair?: () => void;
  /** Leva a uma seção já preenchida para corrigir. Sem ele, o resumo não tem links. */
  onIrParaSecao?: (grupoId: string, itemId?: string) => void;
  /** Pede confirmação toda vez que a pessoa aperta o X, avisando que nada fica salvo. Desligue só nas telas finais, em que não há nada a perder. */
  avisarAoSair?: boolean;
  /** Mostra o resumo na lateral (e o botão "Ver resumo" em telas estreitas). Desligue na tela de revisão, onde o resumo é o próprio conteúdo. */
  resumoLateral?: boolean;
  children: ReactNode;
}

/**
 * Casca das telas do fluxo (Preencher → Revisar → Pagar → Baixar PDF).
 * Desktop: o formulário fica no centro e o resumo em árvore numa sidebar fixa à direita, na altura da tela e com
 * rolagem própria (cresce bem quando a árvore tiver muita coisa). Telas estreitas: o resumo abre em um painel pelo
 * botão "Ver resumo", onde também dá para ir direto a uma seção. O progresso (etapas e páginas) fica fora da árvore,
 * sempre visível. Sem login.
 */
export function FluxoShell({ modelo, etapa, pagina, resumo, onSair, onIrParaSecao, avisarAoSair = true, resumoLateral = true, children }: FluxoShellProps) {
  const [resumoAberto, setResumoAberto] = useState(false);
  const preenchidas = resumo.reduce((n, g) => n + g.itens.length, 0);
  const [saidaAberta, setSaidaAberta] = useState(false);
  // fecha o painel antes (ele devolve o foco ao botão que o abriu) e só então leva ao item
  const ir = onIrParaSecao && ((grupo: string, item?: string) => { setResumoAberto(false); setTimeout(() => onIrParaSecao(grupo, item), 60); });

  const tentarSair = () => {
    if (avisarAoSair) { setSaidaAberta(true); return; }
    onSair?.();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <AppHeader
          align="start"
          logo={
            <>
              <Button variant="ghost" iconOnly iconLeft={<X size={24} />} aria-label="Sair do preenchimento" onClick={tentarSair} />
              <span className={styles.modelo}>{modelo}</span>
            </>
          }
          actions={
            resumoLateral ? (
              <span className={styles.verResumo}>
                <Button variant="ghost" iconLeft={<Eye size={20} />} onClick={() => setResumoAberto(true)}>Ver resumo{preenchidas > 0 ? ` (${preenchidas})` : ''}</Button>
              </span>
            ) : undefined
          }
        />
      </div>

      <div className={cx(styles.layout, !resumoLateral && styles.semLateral)}>
        <main className={styles.main}>
          <div className={styles.container}>
            <StepperFluxo etapa={etapa} pagina={pagina?.atual} />

            <div className={styles.conteudo}>{children}</div>
          </div>
        </main>

        {resumoLateral && (
          <aside className={styles.lateral} aria-label="Resumo do que você escolheu">
            <div className={styles.lateralTopo}>
              <h2 className={styles.lateralTitulo}>Seu resumo</h2>
              <p className={styles.lateralSub}>
                {preenchidas === 0 ? 'O que você escolhe aparece aqui.' : `${preenchidas} ${preenchidas === 1 ? 'informação preenchida' : 'informações preenchidas'}`}
              </p>
            </div>
            <ResumoArvore grupos={resumo} onIr={ir} />
          </aside>
        )}
      </div>

      <Dialog
        open={saidaAberta}
        onClose={() => setSaidaAberta(false)}
        title="Sair do preenchimento?"
        subtitle="O que você preencheu não fica salvo. Se sair agora, vai precisar começar do início."
        size="sm"
        actions={
          <>
            <Button variant="secondary" onClick={() => { setSaidaAberta(false); onSair?.(); }}>Sair mesmo assim</Button>
            <Button onClick={() => setSaidaAberta(false)}>Continuar preenchendo</Button>
          </>
        }
      />

      <Dialog
        open={resumoAberto}
        onClose={() => setResumoAberto(false)}
        title="Seu resumo"
        subtitle={preenchidas === 0 ? 'O que você escolher aparece aqui.' : 'O que você já escolheu.'}
        size="md"
      >
        <ResumoArvore grupos={resumo} onIr={ir} />
      </Dialog>
    </div>
  );
}
