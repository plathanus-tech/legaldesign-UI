import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Building, Fence, House, Store } from 'lucide-react';
import { Button } from '../../index';
import { FluxoShell } from '../fluxo/FluxoShell';
import { AvisoDeErros, levarAoPrimeiroErro } from '../fluxo/AvisoDeErros';
import { GrupoOpcoes, OpcaoCard } from '../fluxo/OpcaoCard';
import { irParaCampo, useFocoInicial } from '../fluxo/foco';
import { construirResumo, paginaDoItem, TOTAL_PAGINAS } from '../fluxo/resumo';
import { lerRespostas, salvarRespostas, TITULO_IMOVEL, TITULO_USO, type Imovel, type ParteResp, type Uso } from '../fluxo/respostas';
import { useEdicaoDoResumo, SALVAR_E_VOLTAR } from '../fluxo/edicaoDoResumo';
import styles from './TipoDeLocacao.module.css';

export type { Imovel, Uso } from '../fluxo/respostas';

interface Opcao<T extends string> { value: T; titulo: string; descricao: string; icone: ReactNode }

export const USOS: Opcao<Uso>[] = [
  { value: 'residencial', titulo: TITULO_USO.residencial, descricao: 'Para morar', icone: <House /> },
  { value: 'comercial', titulo: TITULO_USO.comercial, descricao: 'Para um negócio', icone: <Store /> },
];

/** As opções de imóvel dependem do uso. As de imóvel comercial ainda precisam ser confirmadas com o cliente. */
export const IMOVEIS: Record<Uso, Opcao<Imovel>[]> = {
  residencial: [
    { value: 'casa-condominio', titulo: TITULO_IMOVEL['casa-condominio'], descricao: 'Casa localizada em condomínio, com áreas ou regras compartilhadas.', icone: <Fence /> },
    { value: 'apartamento-condominio', titulo: TITULO_IMOVEL['apartamento-condominio'], descricao: 'Apartamento em edifício ou condomínio residencial.', icone: <Building /> },
    { value: 'casa-fora', titulo: TITULO_IMOVEL['casa-fora'], descricao: 'Casa independente, sem condomínio compartilhado.', icone: <House /> },
  ],
  comercial: [
    { value: 'condominio', titulo: TITULO_IMOVEL.condominio, descricao: 'Imóvel localizado em condomínio, com áreas ou regras compartilhadas.', icone: <Building /> },
    { value: 'fora-condominio', titulo: TITULO_IMOVEL['fora-condominio'], descricao: 'Imóvel independente, sem condomínio compartilhado.', icone: <Store /> },
  ],
};

export interface TipoDeLocacaoProps {
  /** Escolhas iniciais (para mostrar a tela já preenchida). */
  inicial?: { uso?: Uso; imovel?: Imovel };
  /** Dados das pessoas já preenchidos (para o índice). Sem isso, usa o que ficou guardado na sessão do protótipo. */
  locador?: ParteResp;
  /** Uso do imóvel quando os dados das pessoas foram preenchidos. Se for diferente do atual, o índice pede revisão. */
  usoAoPreencherLocador?: Uso;
  /** Lembra as respostas ao ir e voltar entre as telas do protótipo (sessão do navegador). */
  persistir?: boolean;
  /** Volta à página inicial. */
  onSair?: () => void;
  /** Leva a outra seção pelo índice do resumo. */
  onIrParaSecao?: (grupoId: string, itemId?: string) => void;
  /** Segue para a próxima página (1.2, Pessoas envolvidas). Só é chamado com as duas escolhas feitas. */
  onSeguinte?: (escolhas: { uso: Uso; imovel: Imovel }) => void;
  /** Volta à revisão (quando a pessoa chegou pelo "Editar" dela). Com isso, "Seguinte" vira "Salvar e voltar ao resumo". */
  onVoltarAoResumo?: () => void;
}

/**
 * Tela 1.1: primeira página do preenchimento. Duas escolhas em cards, em linguagem simples: para que o imóvel será
 * usado e como ele é (com ou sem condomínio). As respostas definem quais perguntas aparecem depois e vão para o
 * índice do contrato. A segunda pergunta só aparece depois da primeira. Se a pessoa voltar aqui e mudar o uso depois
 * de ter preenchido as pessoas envolvidas, o índice marca essa seção para revisão.
 */
export function TipoDeLocacao({ onVoltarAoResumo, inicial, locador, usoAoPreencherLocador, persistir = true, onSair, onIrParaSecao, onSeguinte }: TipoDeLocacaoProps) {
  const doResumo = useEdicaoDoResumo('tipo-locacao') && !!onVoltarAoResumo;
  const sessao = useMemo(() => (persistir ? lerRespostas() : {}), [persistir]);
  const [uso, setUso] = useState<Uso | null>(inicial?.uso ?? sessao.uso ?? null);
  const [imovel, setImovel] = useState<Imovel | null>(inicial?.imovel ?? sessao.imovel ?? null);

  // guarda a cada mudança: voltar pelo resumo ou por outra página nunca perde as escolhas
  useEffect(() => { if (persistir) salvarRespostas({ uso: uso ?? undefined, imovel: imovel ?? undefined }); }, [persistir, uso, imovel]);

  const [tentou, setTentou] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const erroUso = tentou && !uso;
  const erroImovel = tentou && !!uso && !imovel;
  const qtdErros = (erroUso ? 1 : 0) + (erroImovel ? 1 : 0);
  const raiz = useRef<HTMLDivElement>(null);
  useFocoInicial(raiz);
  // item da própria página: foca o campo; de outra página: navega
  const irPara = (grupo: string, item?: string) => (paginaDoItem(item) === 'tipo-locacao' ? irParaCampo(raiz.current, item) : onIrParaSecao?.(grupo, item));

  const escolherUso = (novo: string) => {
    const u = novo as Uso;
    setUso(u);
    // as opções de imóvel mudam com o uso: só mantém a escolha se ainda existir
    if (imovel && !IMOVEIS[u].some(o => o.value === imovel)) setImovel(null);
  };

  const resumo = construirResumo({
    atual: 'imovel',
    uso,
    imovel,
    locador: locador ?? sessao.locador,
    locatario: sessao.locatario,
    administracao: sessao.administracao,
    imobiliaria: sessao.imobiliaria,
    usoAoPreencherLocador: usoAoPreencherLocador ?? sessao.usoAoPreencherLocador,
    contrato: sessao.contrato,
  });


  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={0} pagina={{ atual: 1, total: TOTAL_PAGINAS }} resumo={resumo} onSair={onSair} onIrParaSecao={irPara}>
      <div className={styles.pagina} ref={raiz}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>Que imóvel vai ser alugado?</h1>
          <p className={styles.lead}>
            Responda a duas perguntas para personalizarmos seu contrato.
          </p>
        </header>

        <div data-foco="uso" data-invalido={erroUso ? 'true' : undefined}>
        <GrupoOpcoes legenda="Para que o imóvel será usado?" colunas={2} curtas erro={erroUso ? 'Escolha para que o imóvel será usado.' : undefined}>
          {USOS.map(o => (
            <OpcaoCard key={o.value} name="uso" value={o.value} checked={uso === o.value} onChange={escolherUso} icone={o.icone} titulo={o.titulo} descricao={o.descricao} />
          ))}
        </GrupoOpcoes>
        </div>

        {uso && (
          <div data-foco="tipo-imovel" data-invalido={erroImovel ? 'true' : undefined} className={styles.aparece}>
          <GrupoOpcoes
            legenda="Como é o imóvel?"
            ajuda="Condomínio é quando o imóvel faz parte de um conjunto, com regras e taxas em comum"
            colunas={uso === 'residencial' ? 3 : 2}
            erro={erroImovel ? 'Escolha como é o imóvel.' : undefined}
          >
            {IMOVEIS[uso].map(o => (
              <OpcaoCard key={o.value} name="imovel" value={o.value} checked={imovel === o.value} onChange={v => setImovel(v as Imovel)} icone={o.icone} titulo={o.titulo} descricao={o.descricao} />
            ))}
          </GrupoOpcoes>
          </div>
        )}

        <AvisoDeErros tentativa={tentativa} quantidade={qtdErros} />

        <div className={styles.acoes}>
          <Button
            iconRight={doResumo ? undefined : <ArrowRight size={20} />}
            onClick={() => {
              setTentou(true);
              if (!uso || !imovel) {
                // com a primeira ainda sem resposta, só ela aparece (a segunda depende dela): um erro, sem aviso
                setTentativa(n => n + 1);
                levarAoPrimeiroErro(raiz.current);
                return;
              }
              if (persistir) salvarRespostas({ uso, imovel });
              if (doResumo) { onVoltarAoResumo?.(); return; }
              onSeguinte?.({ uso, imovel });
            }}
          >
            {doResumo ? SALVAR_E_VOLTAR : 'Seguinte'}
          </Button>
        </div>
      </div>
    </FluxoShell>
  );
}
