import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, PenLine, Share2, ShieldCheck } from 'lucide-react';
import { iconeDaOpcao } from '../fluxo/iconeDaOpcao';
import { Button, Dialog, Feedback, Textarea } from '../../index';
import { limparEdicaoDoResumo, lerEdicaoDoResumo } from '../fluxo/foco';
import { AvisoFlutuante, type AvisoFlutuanteDados } from '../fluxo/AvisoFlutuante';
import { FluxoShell } from '../fluxo/FluxoShell';
import { GrupoOpcoes, OpcaoCard } from '../fluxo/OpcaoCard';
import { chaveDoTexto, MAX_PERSONALIZADO, opcoesDoPonto, OUTRO, pontoPersonalizado, type PontoPadrao } from '../fluxo/perguntas';
import { dataFinal, diasTexto } from '../fluxo/dias';
import { construirResumo, pendenciasDoContrato, type ContextoResumo } from '../fluxo/resumo';
import { lerRespostas, limparRespostas, salvarRespostas, type Contrato, type Respostas } from '../fluxo/respostas';
import type { ResumoGrupo } from '../fluxo/ResumoArvore';
import { CompartilharModal } from './CompartilharModal';
import { PainelContrato } from './PainelContrato';
import styles from './ResumoContrato.module.css';

export interface ResumoContratoProps {
  /** Respostas para mostrar (para as stories). Sem isso, usa o que a pessoa preencheu na sessão do protótipo. */
  respostas?: Respostas;
  onSair?: () => void;
  /** Volta à última página do preenchimento. */
  onVoltar?: () => void;
  /** Leva à pergunta para corrigir (ou preencher). */
  onIrParaSecao?: (grupoId: string, itemId?: string) => void;
  /** Só para as stories: abre já com o modal de compartilhar o resumo aberto. */
  compartilharAberto?: boolean;
  /** Só para as stories: simula a volta de uma edição ("Salvar e voltar ao resumo"), com o item que foi editado. */
  editadoAgora?: string;
  /** Segue para escolher o estilo do contrato. Com algo faltando, não avança: leva ao primeiro item para completar. */
  onSeguinte?: () => void;
  /** Só quando a pessoa chega pelo link para voltar e editar: quantos dias o resumo ainda fica guardado. Com 2 dias ou menos, vira um aviso (warning); 0 é o último dia. */
  diasRestantes?: number;
}

/**
 * Tela 2.1: revisão do contrato. Mostra, em frases simples, o que vai no contrato: o que a pessoa respondeu e também o
 * que vem como cláusulas padrão nos assuntos que não foram perguntados, para ela decidir se serve. Nunca mostra o texto
 * das cláusulas. Cada frase de resposta tem o ícone de editar (leva direto à pergunta, com dica "Editar" no desktop); cada ponto de cláusulas padrão tem
 * o ícone de personalizar (dica "Personalizar"). O resumo pode ser compartilhado para outra pessoa conferir. Esta tela só é alcançada com os obrigatórios preenchidos; se algo faltar mesmo assim (por exemplo, por um link
 * antigo), aparece em destaque, com atalho para preencher, e impede de seguir.
 */
export function ResumoContrato({ respostas, onSair, onVoltar, onIrParaSecao, compartilharAberto = false, editadoAgora, onSeguinte, diasRestantes }: ResumoContratoProps) {
  // chegou de uma página que foi editar a partir daqui ("Salvar e voltar ao resumo")? Então mantém o que foi editado e leva o foco ao item
  const veioDeEdicao = useMemo(() => lerEdicaoDoResumo(), []);
  const itemEditado = editadoAgora ?? veioDeEdicao;
  useEffect(() => { limparEdicaoDoResumo(); }, []);
  // as stories mostram um preenchimento de exemplo: guarda na sessão para o "Editar" abrir as páginas já preenchidas
  const r = useMemo<Respostas>(() => {
    if (respostas && !veioDeEdicao) { limparRespostas(); salvarRespostas(respostas); return respostas; }
    return lerRespostas();
  }, [respostas]);

  // textos personalizados dos pontos de cláusulas padrão ficam junto das demais respostas
  const [contrato, setContrato] = useState<Contrato>(r.contrato ?? {});
  const [editando, setEditando] = useState<PontoPadrao | null>(null);
  const [compartilhando, setCompartilhando] = useState(compartilharAberto);
  const [escolha, setEscolha] = useState('padrao');
  const [texto, setTexto] = useState('');
  const abrirEdicao = (ponto: PontoPadrao) => {
    setEditando(ponto);
    setEscolha(pontoPersonalizado(ponto, contrato) ? (contrato[ponto.id] ?? 'padrao') : 'padrao');
    setTexto(contrato[chaveDoTexto(ponto.id)] ?? '');
  };
  // "Padrão" apaga a escolha; uma alternativa guarda o código dela; "Outro" guarda o texto digitado
  const guardarPonto = () => {
    if (!editando) return;
    const novo = { ...contrato };
    delete novo[editando.id];
    delete novo[chaveDoTexto(editando.id)];
    if (escolha === OUTRO) { novo[editando.id] = OUTRO; novo[chaveDoTexto(editando.id)] = texto.trim(); }
    else if (escolha !== 'padrao') novo[editando.id] = escolha;
    setContrato(novo);
    salvarRespostas({ contrato: novo });
    setEditando(null);
  };

  const ctx: ContextoResumo = {
    uso: r.uso, imovel: r.imovel, locador: r.locador, locatario: r.locatario, administracao: r.administracao,
    imobiliaria: r.imobiliaria, usoAoPreencherLocador: r.usoAoPreencherLocador, contrato,
  };
  const grupos: ResumoGrupo[] = construirResumo(ctx);
  const pendencias = pendenciasDoContrato(ctx);

  // Com algo faltando, "seguir" não avança: mostra o aviso em vermelho e leva ao primeiro item para completar
  const [tentou, setTentou] = useState(false);
  const painel = useRef<HTMLDivElement>(null);
  // voltando de uma edição que deixou algo faltando (por exemplo, uma pergunta nova), vai direto à pendência
  const [levar, setLevar] = useState(itemEditado && pendencias.length > 0 ? 1 : 0);
  // voltando de uma edição: avisa que a alteração foi salva (e, se ela pede mais alguma informação, que ela está logo abaixo)
  const [aviso] = useState<AvisoFlutuanteDados | null>(() => (itemEditado
    ? { id: Date.now(), title: 'Alteração salva', message: pendencias.length > 0 ? 'Ela pede mais uma informação. Complete abaixo.' : 'Seu contrato foi atualizado com sucesso.' }
    : null));
  const seguir = () => {
    if (pendencias.length === 0) { onSeguinte?.(); return; }
    setTentou(true);
    setLevar(n => n + 1);
  };

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={1} pagina={{ atual: 1 }} resumo={grupos} resumoLateral={false} onSair={onSair} onIrParaSecao={onIrParaSecao}>
      <div className={styles.pagina}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>Revise o seu contrato</h1>
          <p className={styles.lead}>Veja como ficam as suas escolhas e o que já vem como cláusulas padrão. Corrija o que quiser antes de seguir.</p>
          {diasRestantes !== undefined && diasRestantes > 2 && <p className={styles.prazo}>Este resumo fica guardado por mais {diasTexto(diasRestantes)}, até {dataFinal(diasRestantes)}. Depois disso, ele é apagado.</p>}
        </header>

        {diasRestantes !== undefined && diasRestantes <= 2 && (
          <Feedback
            type="warning"
            title={diasRestantes <= 0 ? 'Hoje é o último dia do seu resumo' : `Faltam ${diasTexto(diasRestantes)} para o seu resumo ser apagado`}
            message={diasRestantes <= 0 ? 'Termine o contrato hoje. Depois, o resumo é apagado e o link deixa de funcionar.' : `Ele fica disponível até ${dataFinal(diasRestantes)}. Termine o contrato ou compartilhe antes disso. Depois, o resumo é apagado e o link deixa de funcionar.`}
          />
        )}

        <div className={styles.compartilhar}>
          <div className={styles.compartilharTexto}>
            <p className={styles.compartilharTitulo}>Quer que outra pessoa confira?</p>
            <p className={styles.compartilharAjuda}>Envie para outra pessoa conferir ou guarde um link para continuar editando depois.</p>
          </div>
          <Button variant="outline" iconLeft={<Share2 size={20} />} onClick={() => setCompartilhando(true)}>Compartilhar resumo</Button>
        </div>

        {pendencias.length > 0 && (
          <Feedback type={tentou ? 'error' : 'warning'} title={pendencias.length === 1 ? 'Falta preencher uma página' : `Faltam informações em ${pendencias.length} páginas`} message={tentou ? 'Complete o que está marcado abaixo com “Preencher” ou “Completar” para seguir.' : 'Complete o que falta, abaixo, para seguir para a próxima etapa.'} />
        )}

        <PainelContrato grupos={grupos} pendencias={pendencias} contrato={contrato} imovel={r.imovel} onEditar={onIrParaSecao} onPersonalizar={abrirEdicao} painelRef={painel} levarAPendencia={levar} focoEm={itemEditado ?? undefined} />

        <div className={styles.acoes}>
          <Button variant="ghost" onClick={onVoltar}>Voltar</Button>
          <Button iconRight={<ArrowRight size={20} />} onClick={seguir}>Escolher o estilo do contrato</Button>
        </div>
      </div>

      {/* "Alteração salva": flutua no alto, centralizado, e some depois de alguns segundos */}
      <AvisoFlutuante aviso={aviso} />

      {/* compartilhar o resumo: modal aberto pelo botão "Compartilhar resumo"; os links valem só pelo tempo que resta */}
      <CompartilharModal open={compartilhando} onClose={() => setCompartilhando(false)} diasRestantes={diasRestantes} />

      <Dialog
        open={editando !== null}
        onClose={() => setEditando(null)}
        title={editando ? editando.titulo : ''}
        subtitle="Escolha como este ponto deve ficar no contrato."
        size="lg"
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button disabled={escolha === OUTRO && texto.trim() === ''} onClick={guardarPonto}>Salvar</Button>
          </>
        }
      >
        {editando && (
          <div className={styles.opcoesPonto}>
            <GrupoOpcoes legenda="Como deve ficar?" colunas={2}>
              <OpcaoCard name="ponto" value="padrao" checked={escolha === 'padrao'} onChange={setEscolha} icone={<ShieldCheck />} titulo="Cláusula padrão" descricao={editando.padrao} />
              {opcoesDoPonto(editando, contrato).map(o => (
                <OpcaoCard key={o.valor} name="ponto" value={o.valor} checked={escolha === o.valor} onChange={setEscolha} icone={iconeDaOpcao(o.titulo)} titulo={o.titulo} descricao={o.frase} />
              ))}
              <OpcaoCard name="ponto" value={OUTRO} checked={escolha === OUTRO} onChange={setEscolha} icone={<PenLine />} titulo="Outro" descricao="Escrever do meu jeito, só se nenhuma opção servir" />
            </GrupoOpcoes>
            {escolha === OUTRO && (
              <>
                <Feedback type="warning" title="Este texto entra no contrato como você escrever" message="O sistema não corrige nem reescreve o que você digitar. Confira a redação e use frases claras." />
                <Textarea
                  label="Escreva como deve ficar"
                  value={texto}
                  maxLength={MAX_PERSONALIZADO}
                  rows={5}
                  helperText={`${texto.length} de ${MAX_PERSONALIZADO} caracteres. O limite evita mudar demais o modelo do contrato`}
                  onChange={e => setTexto(e.target.value)}
                />
              </>
            )}
          </div>
        )}
      </Dialog>
    </FluxoShell>
  );
}
