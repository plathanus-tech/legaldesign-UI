import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Building, UserRound } from 'lucide-react';
import { Button } from '../../index';
import { FluxoShell } from '../fluxo/FluxoShell';
import { irParaCampo, useFocoInicial } from '../fluxo/foco';
import { AvisoDeErros, levarAoPrimeiroErro } from '../fluxo/AvisoDeErros';
import { GrupoOpcoes, OpcaoCard } from '../fluxo/OpcaoCard';
import { construirResumo, paginaDoItem, TOTAL_PAGINAS } from '../fluxo/resumo';
import { IMOBILIARIA_VAZIA, lerRespostas, salvarRespostas, type Administracao, type DadosLocador, type Imovel, type Respostas, type Uso } from '../fluxo/respostas';
import { useEdicaoDoResumo, SALVAR_E_VOLTAR } from '../fluxo/edicaoDoResumo';
import { FormParte, validarParte } from './FormParte';
import styles from './PessoasEnvolvidas.module.css';

export interface AdministracaoDoAluguelProps {
  /** Resposta inicial (para mostrar a tela preenchida). Sem isso, usa a sessão do protótipo. */
  inicial?: Administracao;
  /** Dados da imobiliária já preenchidos. */
  inicialImobiliaria?: Partial<DadosLocador>;
  imovel?: { uso: Uso; imovel: Imovel };
  /** Respostas de outras páginas, para o índice. Sem isso, usa a sessão do protótipo. */
  outras?: Pick<Respostas, 'locador' | 'locatario'>;
  mostrarErros?: boolean;
  persistir?: boolean;
  onSair?: () => void;
  onVoltar?: () => void;
  onIrParaSecao?: (grupoId: string, itemId?: string) => void;
  onSeguinte?: (dados: { administracao: Administracao; imobiliaria?: DadosLocador }) => void;
  /** Volta à revisão (quando a pessoa chegou pelo "Editar" dela). Com isso, "Seguinte" vira "Salvar e voltar ao resumo". */
  onVoltarAoResumo?: () => void;
}

/**
 * Página 4: quem vai administrar o aluguel. Duas opções que se entendem sozinhas (nada de "Sim/Não"): uma imobiliária
 * ou corretor, ou o próprio proprietário. Só com a imobiliária aparece o formulário dela. O que foi digitado fica
 * guardado se a pessoa trocar para "o próprio proprietário" e voltar atrás.
 */
export function AdministracaoDoAluguel({ onVoltarAoResumo, inicial, inicialImobiliaria, imovel, outras, mostrarErros = false, persistir = true, onSair, onVoltar, onIrParaSecao, onSeguinte }: AdministracaoDoAluguelProps) {
  const sessao = useMemo(() => (persistir ? lerRespostas() : {}), [persistir]);
  const doResumo = useEdicaoDoResumo('administracao') && !!onVoltarAoResumo;
  const [administracao, setAdministracao] = useState<Administracao | null>(inicial ?? sessao.administracao ?? 'proprio'); // o proprietário já informou os dados: ele vem escolhido
  const [imobiliaria, setImobiliaria] = useState<DadosLocador>({ ...IMOBILIARIA_VAZIA, ...sessao.imobiliaria, ...inicialImobiliaria });
  const [tentou, setTentou] = useState(mostrarErros);
  const [tentativa, setTentativa] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  useFocoInicial(formRef);

  const uso = sessao.uso ?? imovel?.uso;
  const tipoImovel = sessao.imovel ?? imovel?.imovel;

  const qtdErros = (administracao === null ? 1 : 0) + (administracao === 'imobiliaria' ? Object.keys(validarParte(imobiliaria, 'imobiliaria')).length : 0);
  const guardar = () => { if (persistir) salvarRespostas({ administracao: administracao ?? undefined, imobiliaria }); };

  // guarda a cada mudança: voltar por outra página (ou pelo resumo) nunca perde o que já foi preenchido
  useEffect(guardar, [administracao, imobiliaria]); // eslint-disable-line react-hooks/exhaustive-deps

  const seguir = () => {
    setTentou(true);
    if (qtdErros > 0 || !administracao) {
      setTentativa(n => n + 1);
      levarAoPrimeiroErro(formRef.current);
      return;
    }
    guardar();
    if (doResumo) { onVoltarAoResumo?.(); return; }
    onSeguinte?.({ administracao, imobiliaria: administracao === 'imobiliaria' ? imobiliaria : undefined });
  };

  const resumo = construirResumo({
    atual: 'pessoas',
    uso,
    imovel: tipoImovel,
    locador: sessao.locador ?? outras?.locador,
    locatario: sessao.locatario ?? outras?.locatario,
    administracao,
    imobiliaria,
    usoAoPreencherLocador: sessao.usoAoPreencherLocador,
    contrato: sessao.contrato,
  });

  const irPara = (grupo: string, item?: string) => {
    if (paginaDoItem(item) === 'administracao') { irParaCampo(formRef.current, item); return; }
    guardar();
    onIrParaSecao?.(grupo, item);
  };

  const erro = tentou && administracao === null;

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={0} pagina={{ atual: 3, total: TOTAL_PAGINAS }} resumo={resumo} onSair={() => { guardar(); onSair?.(); }} onIrParaSecao={irPara}>
      <div className={styles.pagina} ref={formRef}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>Quem vai administrar o aluguel?</h1>
          <p className={styles.lead}>Informe quem ficará responsável por cuidar da locação do imóvel.</p>        </header>

        <div data-foco="adm" data-invalido={erro ? 'true' : undefined}>
          <GrupoOpcoes legenda="O aluguel será administrado por:" colunas={2} erro={erro ? 'Escolha quem vai administrar o aluguel.' : undefined}>
            <OpcaoCard name="administracao" value="proprio" checked={administracao === 'proprio'} onChange={() => setAdministracao('proprio')} icone={<UserRound />} titulo="O próprio proprietário" descricao="O proprietário será responsável pelo aluguel." />
            <OpcaoCard name="administracao" value="imobiliaria" checked={administracao === 'imobiliaria'} onChange={() => setAdministracao('imobiliaria')} icone={<Building />} titulo="Uma imobiliária ou corretor" descricao="Vou informar os dados de quem administra." />
          </GrupoOpcoes>
        </div>

        {administracao === 'imobiliaria' && <FormParte papel="imobiliaria" dados={imobiliaria} onChange={setImobiliaria} tentou={tentou} foco="imobiliaria-dados" />}

        <AvisoDeErros tentativa={tentativa} quantidade={qtdErros} />

        <div className={styles.acoes}>
          <Button variant="ghost" onClick={() => { guardar(); onVoltar?.(); }}>Voltar</Button>
          <Button iconRight={doResumo ? undefined : <ArrowRight size={20} />} onClick={seguir}>{doResumo ? SALVAR_E_VOLTAR : 'Seguinte'}</Button>
        </div>
      </div>
    </FluxoShell>
  );
}
