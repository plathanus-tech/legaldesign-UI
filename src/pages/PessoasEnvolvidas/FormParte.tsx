import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Building2, Download, FileUp, UserRound, Users, X } from 'lucide-react';
import { Button, Checkbox, Dialog, Dropdown, Feedback, Input } from '../../index';
import { casadoEmComunhaoUniversal, conjugeComAlgo, conjugeObrigatorioPara, precisaAnuente, validarConjuge } from '../fluxo/anuencia';
import { GrupoOpcoes, OpcaoCard } from '../fluxo/OpcaoCard';
import { CONJUGE_VAZIO, type DadosConjuge, type DadosLocador, type TipoLocador } from '../fluxo/respostas';
import { lerArquivoPessoas, NOME_DO_ARQUIVO, salvarArquivoLocador } from './arquivoLocador';
import { buscarEnderecoPorCep, cnpjValido, cpfValido, formatarCep, formatarCnpj, formatarCpf, soDigitos } from './formatos';
import styles from './PessoasEnvolvidas.module.css';

const opcoes = (...itens: string[]) => itens.map(i => ({ label: i, value: i }));
export const ESTADOS_CIVIS = opcoes('Solteiro(a)', 'Casado(a)', 'União estável', 'Divorciado(a)', 'Separado(a)', 'Viúvo(a)');
export const REGIMES = opcoes('Comunhão parcial de bens', 'Comunhão universal de bens', 'Separação de bens', 'Participação final nos aquestos');
export const UFS = opcoes('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');
export const PEDE_REGIME = (estadoCivil: string) => estadoCivil === 'Casado(a)' || estadoCivil === 'União estável';

/** Quem é a parte: proprietário (locador), inquilino (locatário) ou imobiliária/corretor (sempre empresa). */
export type PapelParte = 'locador' | 'locatario' | 'imobiliaria' | 'fiador';

type Campo = Exclude<keyof DadosLocador, 'conjuge'>;
export type Erros = Partial<Record<Campo, string>>;

/** Campos que mudam quando o tipo (pessoa/empresa) muda; ficam guardados para voltar se a pessoa trocar de ideia. O endereço é comum aos dois. */
const CAMPOS_DO_TIPO: Campo[] = ['nome', 'documento', 'representante', 'nacionalidade', 'profissao', 'estadoCivil', 'regimeBens', 'creci', 'representanteCpf'];

/** No cadastro do responsável pela intermediação, o documento digitado diz se é uma imobiliária: mais de 11 números é CNPJ. */
export const ehEmpresaPeloDocumento = (documento: string): boolean => soDigitos(documento).length > 11;
/** Formata como CPF (até 11 números) ou CNPJ (mais que isso), conforme a pessoa digita. */
export const formatarCpfOuCnpj = (v: string): string => { const d = soDigitos(v).slice(0, 14); return d.length <= 11 ? formatarCpf(d) : formatarCnpj(d); };

/** Regras de preenchimento. Só entram os campos que valem para o caso (pessoa ou empresa; regime só se casado/união estável). A imobiliária é sempre empresa. */
export function validarParte(d: DadosLocador, papel: PapelParte): Erros {
  const e: Erros = {};
  const falta = (c: Campo, msg: string) => { if (!d[c].trim()) e[c] = msg; };
  const tipo = papel === 'imobiliaria' ? 'pessoa' : papel === 'fiador' ? 'pessoa' : d.tipo;

  // Responsável pela intermediação: um cadastro só, para corretor ou imobiliária. Com CNPJ, passa a pedir o representante legal.
  if (papel === 'imobiliaria') {
    falta('nome', 'Informe o nome do corretor ou da imobiliária.');
    const empresaDoc = ehEmpresaPeloDocumento(d.documento);
    if (!d.documento.trim()) e.documento = 'Informe o CPF ou o CNPJ.';
    else if (empresaDoc ? !cnpjValido(d.documento) : !cpfValido(d.documento)) e.documento = `Confira o ${empresaDoc ? 'CNPJ' : 'CPF'}: ele parece estar incompleto ou errado.`;
    if (empresaDoc) falta('representante', 'Informe o nome de quem assina pela imobiliária.');
    if (empresaDoc && d.representanteCpf.trim() && !cpfValido(d.representanteCpf)) e.representanteCpf = 'Confira o CPF: ele parece estar incompleto ou errado.';
  }

  if (!tipo) e.tipo = 'Escolha se é uma pessoa ou uma empresa.';
  if (tipo === 'pessoa' && papel !== 'imobiliaria') {
    falta('nome', 'Informe o nome completo.');
    if (!d.documento.trim()) e.documento = 'Informe o CPF.'; else if (!cpfValido(d.documento)) e.documento = 'Confira o CPF: ele parece estar incompleto ou errado.';
    falta('nacionalidade', 'Informe a nacionalidade.');
    falta('profissao', 'Informe a profissão.');
    falta('estadoCivil', 'Escolha o estado civil.');
    if (PEDE_REGIME(d.estadoCivil)) falta('regimeBens', 'Escolha o regime de bens.');
  }
  if (tipo === 'empresa') {
    falta('nome', 'Informe o nome da empresa (razão social).');
    if (!d.documento.trim()) e.documento = 'Informe o CNPJ.'; else if (!cnpjValido(d.documento)) e.documento = 'Confira o CNPJ: ele parece estar incompleto ou errado.';
    falta('representante', 'Informe o nome de quem assina pela empresa.');
  }
  if (tipo) {
    if (d.cep.replace(/\D/g, '').length !== 8) e.cep = 'Informe o CEP com 8 números.';
    falta('logradouro', 'Informe a rua ou avenida.');
    falta('numero', 'Informe o número (ou "s/n").');
    falta('bairro', 'Informe o bairro.');
    falta('cidade', 'Informe a cidade.');
    falta('uf', 'Escolha o estado.');
  }
  return e;
}

export interface FormParteProps {
  papel: PapelParte;
  /** 1 (padrão) ou 2, quando há mais de uma pessoa na mesma parte. Só muda os títulos e os nomes dos campos. */
  indice?: number;
  dados: DadosLocador;
  onChange: (dados: DadosLocador) => void;
  /** Mostra todos os erros (depois de tentar seguir). Antes disso, só os campos já visitados. */
  tentou: boolean;
  /** Marca (`data-foco`) o primeiro campo, para o resumo levar direto até ele. */
  foco?: string;
  /** Mostra importar/salvar arquivo. Padrão: sim para proprietário e imobiliária, não para quem está alugando (muda a cada contrato). */
  arquivo?: boolean;
  /** Jeito de conversa: o endereço só aparece depois que os dados da pessoa estão completos, e uma frase curta reage quando tudo está pronto. Padrão: não. */
  progressivo?: boolean;
  /** Não mostra aqui o bloco "salvar para usar depois": quem usa o formulário o coloca em outro lugar com `SalvarDados`. */
  semSalvar?: boolean;
  /** Quando o arquivo importado traz mais de uma pessoa, as outras vão para cá, na ordem do arquivo (a primeira vai para o formulário). */
  onImportarOutras?: (dados: DadosLocador[]) => void;
  /** O prazo do contrato pede o cônjuge anuente (120 meses ou mais): para quem é casado(a), os dados do cônjuge passam a ser necessários e a seção abre sozinha. */
  exigeAnuencia?: boolean;
}

interface TextosPapel { titulo: string; legenda?: string; cartaoPessoa?: string; cartaoEmpresa?: string; salvarTitulo: string; salvarAjuda: string }

const TEXTO: Record<PapelParte, TextosPapel> = {
  locador: {
    titulo: 'Dados do proprietário',
    legenda: 'O proprietário é:',
    cartaoPessoa: 'O imóvel pertence a uma pessoa.',
    cartaoEmpresa: 'O imóvel pertence a uma empresa.',
    salvarTitulo: 'Vai alugar outros imóveis?',
    salvarAjuda: 'Salve os dados do proprietário em seu computador para reutilizá-los em outros contratos. O arquivo contém dados pessoais e não é armazenado em nossos servidores.',
  },
  locatario: {
    titulo: 'Dados de quem está alugando',
    legenda: 'Quem está alugando é:',
    cartaoPessoa: 'O aluguel será feito por uma pessoa.',
    cartaoEmpresa: 'O aluguel será feito por uma empresa.',
    salvarTitulo: '',
    salvarAjuda: '',
  },
  imobiliaria: {
    titulo: 'Dados do corretor ou da imobiliária',
    salvarTitulo: 'Sempre trabalha com o mesmo corretor ou a mesma imobiliária?',
    salvarAjuda: 'Salve os dados em um arquivo e importe quando precisar. Nada fica armazenado em nossos servidores. Para excluir, basta apagar o arquivo.',
  },
  fiador: {
    titulo: 'Dados do fiador',
    salvarTitulo: '',
    salvarAjuda: '',
  },
};

/**
 * Bloco de dados de uma parte do contrato: proprietário e inquilino (pessoa ou empresa) ou imobiliária (sempre empresa).
 * Proprietário e imobiliária têm atalho para importar e salvar um arquivo .json no computador da pessoa.
 * Trocar entre pessoa e empresa não apaga o que foi digitado: os dados de cada tipo ficam guardados até a pessoa decidir.
 * Importar um arquivo por cima de dados já preenchidos pede confirmação.
 */
export function FormParte({ papel, indice = 1, dados, onChange, tentou, foco, arquivo = papel === 'locador' || papel === 'imobiliaria', progressivo = false, semSalvar = false, onImportarOutras, exigeAnuencia = false }: FormParteProps) {
  const [tocados, setTocados] = useState<Set<Campo>>(new Set());
  const [tocadosConjuge, setTocadosConjuge] = useState<Set<keyof DadosConjuge>>(new Set());
  // campos que a pessoa está digitando agora: o erro só aparece (ou muda) quando ela sai do campo
  const [editando, setEditando] = useState<Set<string>>(new Set());
  const editar = (c: string) => setEditando(x => (x.has(c) ? x : new Set(x).add(c)));
  const sair = (c: string) => setEditando(x => { if (!x.has(c)) return x; const n = new Set(x); n.delete(c); return n; });
  const [abriuConjuge, setAbriuConjuge] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [importado, setImportado] = useState<DadosLocador[] | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const nomeRef = useRef<HTMLDivElement>(null);
  const guardados = useRef<Partial<Record<TipoLocador, Partial<DadosLocador>>>>({});
  const t = TEXTO[papel];
  const sufixo = indice >= 2 ? ` ${indice}` : '';
  const papelArquivo = papel === 'imobiliaria' ? 'imobiliaria' : 'locador';

  // CEP completo preenche rua, bairro, cidade e estado. Os campos continuam editáveis.
  const [cepStatus, setCepStatus] = useState<'ocioso' | 'buscando' | 'nao-achou' | 'falhou'>('ocioso');
  const dadosRef = useRef(dados);
  dadosRef.current = dados;
  const buscaRef = useRef<AbortController | null>(null);
  useEffect(() => () => buscaRef.current?.abort(), []);

  const tipo = papel === 'imobiliaria' ? 'pessoa' : papel === 'fiador' ? 'pessoa' : dados.tipo;
  const corretor = papel === 'imobiliaria';
  const pessoa = tipo === 'pessoa';
  const empresa = tipo === 'empresa';
  const erros = validarParte(dados, papel);
  // o endereço fica sempre à vista: a pessoa vê desde o começo tudo o que vai ser pedido
  const mostrarEndereco = true;
  const primeiroNome = pessoa ? dados.nome.trim().split(/\s+/)[0] : '';
  const tituloEndereco = progressivo && primeiroNome ? `Endereço de ${primeiroNome}` : progressivo && empresa ? 'Endereço da empresa' : 'Endereço';
  const erroDe = (c: Campo) => ((tentou || tocados.has(c)) && !editando.has(c) ? erros[c] : undefined);
  const caixa = (c: Campo) => ({ 'data-invalido': erroDe(c) ? 'true' : undefined });
  const tocar = (c: Campo) => { sair(c); setTocados(x => new Set(x).add(c)); };

  // Cônjuge anuente: fica dentro desta pessoa. Só abre sozinho quando o prazo exige; antes disso, só um aviso discreto e um botão.
  const casado = pessoa && precisaAnuente(dados);
  const conjugeObrigatorio = conjugeObrigatorioPara(dados, exigeAnuencia);
  const mostrarConjuge = casado && (conjugeObrigatorio || abriuConjuge || conjugeComAlgo(dados.conjuge));
  const errosConjuge = validarConjuge(dados.conjuge);
  const validaConjuge = conjugeObrigatorio || conjugeComAlgo(dados.conjuge);
  const erroConjuge = (c: keyof DadosConjuge) => (validaConjuge && (tentou || tocadosConjuge.has(c)) && !editando.has(`conjuge-${c}`) ? errosConjuge[c] : undefined);
  const alterarConjuge = (c: keyof DadosConjuge, valor: string) => { editar(`conjuge-${c}`); onChange({ ...dados, conjuge: { ...(dados.conjuge ?? CONJUGE_VAZIO), [c]: valor } }); };
  const propsConjuge = (c: keyof DadosConjuge) => ({ error: erroConjuge(c), onBlur: () => { sair(`conjuge-${c}`); setTocadosConjuge(x => new Set(x).add(c)); } });
  // só dá para tirar o cônjuge quando ele não é exigido pelo prazo; os dados digitados dele são apagados
  const removerConjuge = () => { setAbriuConjuge(false); setTocadosConjuge(new Set()); onChange({ ...dados, conjuge: undefined }); };
  const idConjuge = foco ? `${foco}-conjuge` : undefined;
  const nomeDaPessoa = dados.nome.trim().split(/\s+/)[0] || 'esta pessoa';
  const campoProps = (c: Campo) => ({ error: erroDe(c), onBlur: () => tocar(c) });
  const alterar = <C extends Campo>(c: C, valor: DadosLocador[C]) => { editar(c); onChange({ ...dados, [c]: valor }); };

  const mudarCep = (valor: string) => {
    const cep = formatarCep(valor);
    alterar('cep', cep);
    buscaRef.current?.abort();
    if (soDigitos(cep).length !== 8) { setCepStatus('ocioso'); return; }
    const ctrl = new AbortController();
    buscaRef.current = ctrl;
    setCepStatus('buscando');
    buscarEnderecoPorCep(cep, ctrl.signal)
      .then(end => {
        if (ctrl.signal.aborted) return;
        if (!end) { setCepStatus('nao-achou'); return; }
        setCepStatus('ocioso');
        onChange({ ...dadosRef.current, cep, ...end });
      })
      .catch(() => { if (!ctrl.signal.aborted) setCepStatus('falhou'); });
  };
  const ajudaCep = cepStatus === 'buscando' ? 'Buscando o endereço…' : cepStatus === 'nao-achou' ? 'Não encontramos este CEP. Preencha o endereço abaixo' : cepStatus === 'falhou' ? 'Não foi possível buscar o endereço agora. Preencha abaixo' : 'Ao digitar o CEP, preenchemos as informações ligadas a ele';

  const escolherTipo = (v: string) => {
    const novo = v as TipoLocador;
    if (dados.tipo === novo) return;
    // guarda o que foi digitado para o tipo atual e recupera o que já havia para o novo: nada se perde em silêncio
    if (dados.tipo) guardados.current[dados.tipo] = Object.fromEntries(CAMPOS_DO_TIPO.map(c => [c, dados[c]]));
    const recuperado = guardados.current[novo] ?? {};
    const limpo = Object.fromEntries(CAMPOS_DO_TIPO.map(c => [c, ''])) as Partial<DadosLocador>;
    onChange({ ...dados, ...limpo, ...recuperado, tipo: novo });
    setTocados(new Set());
    // a escolha abre os campos: leva o foco para o primeiro, sem a pessoa precisar procurar
    if (progressivo && !dados.tipo) setTimeout(() => nomeRef.current?.querySelector('input')?.focus(), 60);
  };

  const temAlgo = (d: DadosLocador) => CAMPOS_DO_TIPO.some(c => d[c].trim() !== '') || d.cep.trim() !== '' || d.logradouro.trim() !== '';
  const aplicar = (novos: DadosLocador[]) => {
    const novo = novos[0];
    const varias = novos.length > 1 && !!onImportarOutras;
    if (varias) onImportarOutras?.(novos.slice(1));
    onChange(novo);
    setTocados(new Set());
    setAviso({ tipo: 'success', texto: varias ? (novos.length === 2 ? 'Dados dos dois importados.' : `Dados de ${novos.length} pessoas importados.`) + ' Confira se está tudo certo e complete o que faltar.' : 'Dados importados. Confira se está tudo certo e complete o que faltar.' });
  };

  const importar = async (ev: ChangeEvent<HTMLInputElement>) => {
    const arq = ev.target.files?.[0];
    ev.target.value = '';
    if (!arq) return;
    try {
      const lidos = await lerArquivoPessoas(arq, papelArquivo);
      if (temAlgo(dados)) setImportado(lidos); // já há dados digitados: pergunta antes de substituir
      else aplicar(lidos);
    } catch {
      setAviso({ tipo: 'error', texto: 'Não foi possível usar este arquivo. Escolha um arquivo .json salvo por esta tela para este bloco.' });
    }
  };

  return (
    <div className={styles.parte}>
      {arquivo && (
        <>
          <div className={styles.importar}>
            <div className={styles.importarTexto}>
              <p className={styles.importarTitulo}>Já salvou esses dados por aqui antes?</p>
              <p className={styles.importarAjuda}>Importe um arquivo gerado por esta plataforma para preencher os campos automaticamente.</p>
            </div>
            <input ref={arquivoRef} type="file" accept=".json,application/json" className={styles.arquivo} tabIndex={-1} aria-hidden="true" onChange={importar} />
            <Button variant="outline" iconLeft={<FileUp size={24} />} onClick={() => arquivoRef.current?.click()}>Importar arquivo</Button>
          </div>
          {aviso && <Feedback type={aviso.tipo} message={aviso.texto} dismissible onDismiss={() => setAviso(null)} />}
        </>
      )}

      {papel !== 'imobiliaria' && papel !== 'fiador' && (
        <div {...caixa('tipo')}>
          <GrupoOpcoes legenda={indice >= 2 ? (t.legenda ?? '').replace(/^O /, `O ${indice}º `) : (t.legenda ?? '')} colunas={2} curtas>
            <OpcaoCard name={`tipo-${papel}-${indice}`} value="pessoa" checked={pessoa} onChange={escolherTipo} icone={<UserRound />} titulo="Uma pessoa" descricao={t.cartaoPessoa} />
            <OpcaoCard name={`tipo-${papel}-${indice}`} value="empresa" checked={empresa} onChange={escolherTipo} icone={<Building2 />} titulo="Uma empresa" descricao={t.cartaoEmpresa} />
          </GrupoOpcoes>
          {erroDe('tipo') && <p className={styles.erroGrupo} role="alert">{erros.tipo}</p>}
        </div>
      )}

      {tipo && (
        <>
          <section className={styles.secao} aria-label={`${t.titulo}${sufixo}`}>
            {indice < 2 && <h2 className={styles.h2}>{t.titulo}</h2>}
            <div className={styles.grade}>
              <div className={styles.cheio} ref={nomeRef} data-foco={foco} {...caixa('nome')}>
                <Input label={corretor ? 'Nome do corretor ou da imobiliária' : empresa ? 'Nome da empresa (razão social)' : 'Nome completo'} value={dados.nome} autoComplete={corretor ? 'off' : pessoa ? 'name' : 'organization'} onChange={e => alterar('nome', e.target.value)} {...campoProps('nome')} />
              </div>
              <div {...caixa('documento')}>
                <Input label={corretor ? 'CPF ou CNPJ' : empresa ? 'CNPJ' : 'CPF'} value={dados.documento} inputMode="numeric" autoComplete="off" placeholder={corretor ? 'CPF ou CNPJ' : empresa ? '00.000.000/0000-00' : '000.000.000-00'}
                  onChange={e => alterar('documento', corretor ? formatarCpfOuCnpj(e.target.value) : empresa ? formatarCnpj(e.target.value) : formatarCpf(e.target.value))} {...campoProps('documento')} />
              </div>
              {empresa && (
                <div className={styles.cheio} {...caixa('representante')}>
                  <Input label="Nome de quem assina pela empresa" value={dados.representante} autoComplete="off" onChange={e => alterar('representante', e.target.value)} {...campoProps('representante')} />
                </div>
              )}
              {corretor && (
                <>
                  <div {...caixa('creci')}>
                    <Input label="CRECI" optional value={dados.creci} autoComplete="off" onChange={e => alterar('creci', e.target.value)} {...campoProps('creci')} />
                  </div>
                  {/* só quando o documento é um CNPJ (imobiliária): quem assina por ela */}
                  {ehEmpresaPeloDocumento(dados.documento) && (
                    <>
                      <div className={styles.cheio} {...caixa('representante')}>
                        <Input label="Nome do representante legal" value={dados.representante} autoComplete="off" helperText="Quem assina pela imobiliária" onChange={e => alterar('representante', e.target.value)} {...campoProps('representante')} />
                      </div>
                      <div {...caixa('representanteCpf')}>
                        <Input label="CPF do representante" optional value={dados.representanteCpf} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" onChange={e => alterar('representanteCpf', formatarCpf(e.target.value))} {...campoProps('representanteCpf')} />
                      </div>
                    </>
                  )}
                </>
              )}
              {pessoa && !corretor && (
                <>
                  <div {...caixa('nacionalidade')}>
                    <Input label="Nacionalidade" value={dados.nacionalidade} autoComplete="off" onChange={e => alterar('nacionalidade', e.target.value)} {...campoProps('nacionalidade')} />
                  </div>
                  <div {...caixa('profissao')}>
                    <Input label="Profissão" value={dados.profissao} autoComplete="off" onChange={e => alterar('profissao', e.target.value)} {...campoProps('profissao')} />
                  </div>
                  <div {...caixa('estadoCivil')}>
                    <Dropdown label="Estado civil" options={ESTADOS_CIVIS} value={dados.estadoCivil || undefined} onChange={v => { onChange({ ...dados, estadoCivil: v, regimeBens: PEDE_REGIME(v) ? dados.regimeBens : '' }); tocar('estadoCivil'); }} error={erroDe('estadoCivil')} />
                  </div>
                  {PEDE_REGIME(dados.estadoCivil) && (
                    <div {...caixa('regimeBens')}>
                      <Dropdown label="Regime de bens" options={REGIMES} value={dados.regimeBens || undefined} onChange={v => { alterar('regimeBens', v); tocar('regimeBens'); }} error={erroDe('regimeBens')} />
                    </div>
                  )}
                  {(papel === 'locador' || papel === 'locatario') && casadoEmComunhaoUniversal(dados) && (
                    <div className={styles.cheio}>
                      <p className={styles.notaConjuge}>Em comunhão universal de bens, o cônjuge também é {papel === 'locatario' ? 'quem está alugando' : 'proprietário'}. Ele entra como outra pessoa do contrato, com todos os dados.</p>
                    </div>
                  )}
                  {casado && !conjugeObrigatorio && (
                    <div className={styles.cheio}>
                      <p className={styles.notaConjuge}>Se o contrato tiver prazo igual ou superior a 10 anos, poderá ser necessário informar os dados do cônjuge para a autorização do contrato.</p>
                      {!mostrarConjuge && <div className={styles.acaoConjuge}><Button variant="ghost" onClick={() => setAbriuConjuge(true)}>Informar os dados do cônjuge agora</Button></div>}
                    </div>
                  )}
                  {mostrarConjuge && (
                    <div className={styles.cheio} data-foco={idConjuge} data-invalido={(['nome', 'documento', 'nacionalidade', 'profissao'] as const).some(c => erroConjuge(c)) ? 'true' : undefined}>
                      <div className={styles.conjuge} role="group" aria-label={`Cônjuge anuente de ${nomeDaPessoa}`}>
                        <div className={styles.conjugeTopo}>
                          <h3 className={styles.h3}>Cônjuge anuente de {nomeDaPessoa}</h3>
                          {!conjugeObrigatorio && <Button variant="ghost" size="sm" className={styles.botaoRemover} iconLeft={<X size={16} />} onClick={removerConjuge}>Remover cônjuge</Button>}
                        </div>
                        <p className={styles.notaConjuge}>
                          {conjugeObrigatorio
                            ? 'Como o contrato tem prazo de 10 anos ou mais, precisamos dos dados do cônjuge para a autorização do contrato. Ele assina como anuente, não como proprietário nem como quem está alugando.'
                            : 'O cônjuge assina como anuente, para autorizar o contrato. Ele não é proprietário nem quem está alugando.'}
                        </p>
                        <div className={styles.grade}>
                          <div className={styles.cheio}><Input label="Nome completo do cônjuge" value={dados.conjuge?.nome ?? ''} autoComplete="off" onChange={e => alterarConjuge('nome', e.target.value)} {...propsConjuge('nome')} /></div>
                          <Input label="CPF do cônjuge" value={dados.conjuge?.documento ?? ''} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" onChange={e => alterarConjuge('documento', formatarCpf(e.target.value))} {...propsConjuge('documento')} />
                          <Input label="Nacionalidade" value={dados.conjuge?.nacionalidade ?? ''} autoComplete="off" onChange={e => alterarConjuge('nacionalidade', e.target.value)} {...propsConjuge('nacionalidade')} />
                          <Input label="Profissão" value={dados.conjuge?.profissao ?? ''} autoComplete="off" onChange={e => alterarConjuge('profissao', e.target.value)} {...propsConjuge('profissao')} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* o endereço e o salvar ficam à vista desde o início, mesmo antes de escolher pessoa ou empresa */}
      {mostrarEndereco && (
          <section className={styles.secao} aria-label="Endereço">
            <h2 className={styles.h2}>{tituloEndereco}</h2>
            <div className={styles.grade}>
              <div {...caixa('cep')}>
                <Input label="CEP" value={dados.cep} inputMode="numeric" autoComplete="off" placeholder="00000-000" helperText={ajudaCep} onChange={e => mudarCep(e.target.value)} {...campoProps('cep')} />
              </div>
              <div className={styles.cheio} {...caixa('logradouro')}>
                <Input label="Rua ou avenida" value={dados.logradouro} autoComplete="off" onChange={e => alterar('logradouro', e.target.value)} {...campoProps('logradouro')} />
              </div>
              <div {...caixa('numero')}>
                <Input label="Número" value={dados.numero} autoComplete="off" onChange={e => alterar('numero', e.target.value)} {...campoProps('numero')} />
              </div>
              <div>
                <Input label="Complemento" optional value={dados.complemento} autoComplete="off" onChange={e => alterar('complemento', e.target.value)} />
              </div>
              <div {...caixa('bairro')}>
                <Input label="Bairro" value={dados.bairro} autoComplete="off" onChange={e => alterar('bairro', e.target.value)} {...campoProps('bairro')} />
              </div>
              <div {...caixa('cidade')}>
                <Input label="Cidade" value={dados.cidade} autoComplete="off" onChange={e => alterar('cidade', e.target.value)} {...campoProps('cidade')} />
              </div>
              <div {...caixa('uf')}>
                <Dropdown label="Estado" options={UFS} value={dados.uf || undefined} onChange={v => { alterar('uf', v); tocar('uf'); }} error={erroDe('uf')} />
              </div>
            </div>
          </section>
      )}

      {arquivo && !semSalvar && <SalvarDados papel={papel} dados={dados} />}

      <Dialog
        open={importado !== null}
        onClose={() => setImportado(null)}
        title="Substituir os dados que você preencheu?"
        subtitle="Os dados do arquivo vão ocupar o lugar do que está preenchido neste bloco."
        size="sm"
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportado(null)}>Manter o que preenchi</Button>
            <Button onClick={() => { if (importado) aplicar(importado); setImportado(null); }}>Substituir</Button>
          </>
        }
      />
    </div>
  );
}

const primeiroNome = (d: DadosLocador): string => d.nome.trim().split(/\s+/)[0] ?? '';

/**
 * Bloco "salvar para usar depois": guarda os dados da parte num arquivo .json no computador da pessoa (nada vai para servidor).
 * Fica dentro do formulário por padrão; a página do proprietário o coloca depois de "adicionar outro", no fim da página.
 * Se há mais de uma pessoa preenchida (`demais`), uma janela pergunta o que vai no arquivo: com duas pessoas, as duas, só a primeira ou
 * só a segunda; com três ou mais, uma lista para marcar quem entra. Com uma pessoa só, salva direto.
 */
export function SalvarDados({ papel, dados, demais = [] }: { papel: PapelParte; dados: DadosLocador; demais?: DadosLocador[] }) {
  const [salvou, setSalvou] = useState('');
  const [escolhendo, setEscolhendo] = useState(false);
  const [quem, setQuem] = useState<'ambos' | 'primeiro' | 'segundo'>('ambos');
  const [marcados, setMarcados] = useState<number[]>([]);
  useEffect(() => setSalvou(''), [dados, demais]);
  const t = TEXTO[papel];
  const papelArquivo = papel === 'imobiliaria' ? 'imobiliaria' : 'locador';
  const tipo = papel === 'imobiliaria' ? 'pessoa' : papel === 'fiador' ? 'pessoa' : dados.tipo;
  const podeSalvar = tipo !== '' && dados.nome.trim() !== '';
  // só entram as pessoas já com nome; a primeira é a posição 0
  const todas = [dados, ...demais].filter((d, i) => i === 0 || d.nome.trim() !== '');
  const varias = todas.length > 1;
  const nome = (i: number) => primeiroNome(todas[i]) || `a ${i + 1}ª pessoa`;

  const registrar = (pessoas: DadosLocador[]) => {
    salvarArquivoLocador(pessoas, papelArquivo);
    setSalvou(pessoas.length === 1 ? 'com os dados de uma pessoa' : pessoas.length === 2 ? 'dos dois' : `com os dados de ${pessoas.length} pessoas`);
    setEscolhendo(false);
  };
  const gravar = () => {
    if (todas.length === 2) registrar(quem === 'ambos' ? todas : quem === 'segundo' ? [todas[1]] : [todas[0]]);
    else registrar(todas.filter((_, i) => marcados.includes(i)));
  };
  const clicar = () => {
    if (!varias) { registrar([dados]); return; }
    setQuem('ambos');
    setMarcados(todas.map((_, i) => i));
    setEscolhendo(true);
  };

  return (
    <section className={styles.salvar} aria-label="Salvar para usar depois">
      <h2 className={styles.h2}>{t.salvarTitulo}</h2>
      <p className={styles.salvarAjuda}>{t.salvarAjuda}</p>
      <div>
        <Button variant="outline" iconLeft={<Download size={24} />} disabled={!podeSalvar} onClick={clicar}>Salvar dados no computador</Button>
      </div>
      {!podeSalvar && <p className={styles.ajuda}>Preencha pelo menos o nome para poder salvar.</p>}
      {salvou && <Feedback type="success" message={`Arquivo "${NOME_DO_ARQUIVO[papelArquivo]}" salvo ${salvou}, na pasta de downloads do seu navegador. Mova-o para um lugar só seu.`} />}

      <Dialog
        open={escolhendo}
        onClose={() => setEscolhendo(false)}
        title="O que você quer salvar?"
        subtitle={todas.length === 2 ? 'Há dois preenchidos. Escolha o que vai para o arquivo.' : `Há ${todas.length} preenchidos. Marque quem vai para o arquivo.`}
        size="md"
        actions={
          <>
            <Button variant="secondary" onClick={() => setEscolhendo(false)}>Cancelar</Button>
            <Button disabled={todas.length > 2 && marcados.length === 0} onClick={gravar}>Salvar no computador</Button>
          </>
        }
      >
        {todas.length === 2 ? (
          <div className={styles.escolhaSalvar} role="radiogroup" aria-label="O que salvar">
            <OpcaoCard name="salvar-quem" value="ambos" checked={quem === 'ambos'} onChange={() => setQuem('ambos')} icone={<Users />} titulo="Os dois" descricao={`${nome(0)} e ${nome(1)}, no mesmo arquivo`} />
            <OpcaoCard name="salvar-quem" value="primeiro" checked={quem === 'primeiro'} onChange={() => setQuem('primeiro')} icone={<UserRound />} titulo={`Só ${nome(0)}`} descricao="Para quem aluga sozinho" />
            <OpcaoCard name="salvar-quem" value="segundo" checked={quem === 'segundo'} onChange={() => setQuem('segundo')} icone={<UserRound />} titulo={`Só ${nome(1)}`} descricao="Para quem aluga sozinho" />
          </div>
        ) : (
          <div className={styles.escolhaSalvar} role="group" aria-label="Quem salvar">
            {todas.map((d, i) => (
              <Checkbox key={i} label={d.nome.trim()} checked={marcados.includes(i)} onChange={e => setMarcados(m => (e.target.checked ? [...m, i] : m.filter(x => x !== i)))} />
            ))}
          </div>
        )}
      </Dialog>
    </section>
  );
}
