import { useMemo, useState } from 'react';
import { Clock, Copy, ListChecks, Mail, Share2 } from 'lucide-react';
import { Button, Dialog } from '../../index';
import { AvisoFlutuante, type AvisoFlutuanteDados } from '../fluxo/AvisoFlutuante';
import { dataFinal, PRAZO_DO_RESUMO } from '../fluxo/dias';
import { construirResumo } from '../fluxo/resumo';
import { lerRespostas, limparRespostas, salvarRespostas, type Respostas } from '../fluxo/respostas';
import { WhatsAppIcone } from '../fluxo/WhatsAppIcone';
import { LINK_PARA_CONFERIR } from '../Revisar/CompartilharModal';
import { PainelContrato, type ItemSelecionavel } from '../Revisar/PainelContrato';
import styles from '../fluxo/PaginaEtapa.module.css';
import estilos from './ResumoCompartilhado.module.css';
import { PaginaSimples } from './PaginaSimples';

export interface ResumoCompartilhadoProps {
  /** Respostas para mostrar (para as stories). Sem isso, usa o que está na sessão do protótipo. */
  respostas?: Respostas;
  /** Data real em que o link deixa de funcionar. No produto, vem do servidor (15 dias depois do primeiro envio). */
  expiraEm?: Date;
  /** Atalho para as stories: quantos dias faltam para expirar. Ignorado se `expiraEm` for informado. */
  diasRestantes?: number;
  /** Link do resumo, que vai no fim da mensagem. */
  link?: string;
  /** Já abre a página no modo de seleção (para as stories). */
  selecionando?: boolean;
  /** Começa um novo contrato, independente do resumo recebido. */
  onNovoContrato?: () => void;
}

/** Monta a mensagem com as informações marcadas, agrupadas por assunto, na ordem da árvore. */
export function mensagemDosComentarios(itens: ItemSelecionavel[], link: string): string {
  const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem);
  const secoes: { titulo: string; textos: string[] }[] = [];
  for (const i of ordenados) {
    const s = secoes.find(x => x.titulo === i.secao);
    if (s) s.textos.push(i.texto); else secoes.push({ titulo: i.secao, textos: [i.texto] });
  }
  const corpo = secoes.map(s => `${s.titulo}\n${s.textos.map(t => `- ${t}`).join('\n')}`).join('\n\n');
  return `Oi! Conferi o resumo do contrato e gostaria de conversar sobre alguns pontos:\n\n${corpo}\n\nPodemos conversar sobre esses pontos?\n${link}`;
}

const MENSAGEM_GERAL = (link: string) => `Oi! Estou te enviando o resumo de um contrato de locação para você conferir.\n${link}`;

/**
 * Tela A: o resumo que a pessoa recebe por link (por exemplo, o proprietário recebendo do corretor, ou quem está alugando). Mostra
 * as mesmas frases da revisão, só para conferir: o que quem enviou preencheu e o que o sistema sugere (cláusulas padrão),
 * sem o texto das cláusulas e sem botões de editar. Quem recebe não edita: se algo precisar mudar, fala com quem enviou. Diz
 * até que dia o link funciona (a data real de expiração, não "mais N dias"). Não pede login.
 *
 * Modo de seleção (funcionalidade extra, só de leitura): "Selecionar informações" põe um checkbox em cada informação da árvore
 * (nunca na seção inteira, e só enquanto o modo está ligado). Com pelo menos uma marcada, uma barra fixa mostra quantas são e
 * oferece "Compartilhar comentários", que prepara uma mensagem por WhatsApp ou e-mail, agrupada por assunto. A mensagem abre
 * pronta para revisão: quem envia é a própria pessoa. "Compartilhar resumo" (o resumo todo) é independente da seleção. O
 * preenchimento original nunca é alterado. NOTA PARA DESENVOLVIMENTO: o contato de quem enviou não é conhecido por esta tela;
 * o WhatsApp e o e-mail abrem sem destinatário, e a pessoa escolhe para quem mandar.
 */
export function ResumoCompartilhado({ respostas, expiraEm, diasRestantes = PRAZO_DO_RESUMO, link = LINK_PARA_CONFERIR, selecionando: selecionandoInicial = false, onNovoContrato }: ResumoCompartilhadoProps) {
  const r = useMemo<Respostas>(() => {
    if (respostas) { limparRespostas(); salvarRespostas(respostas); return respostas; }
    return lerRespostas();
  }, [respostas]);
  const grupos = construirResumo({
    uso: r.uso, imovel: r.imovel, locador: r.locador, locatario: r.locatario, administracao: r.administracao,
    imobiliaria: r.imobiliaria, usoAoPreencherLocador: r.usoAoPreencherLocador, contrato: r.contrato,
  });

  const data = expiraEm ? expiraEm.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : dataFinal(diasRestantes);

  const [selecionando, setSelecionando] = useState(selecionandoInicial);
  // guarda a informação inteira (não só a chave), para montar a mensagem mesmo com o assunto fechado
  const [escolhidos, setEscolhidos] = useState<ItemSelecionavel[]>([]);
  // quando a pessoa comenta só um ponto, direto da linha, sem usar o modo de seleção
  const [unico, setUnico] = useState<ItemSelecionavel | null>(null);
  const [janela, setJanela] = useState<'comentarios' | 'resumo' | null>(null);
  const [aviso, setAviso] = useState<AvisoFlutuanteDados | null>(null);

  const alternar = (item: ItemSelecionavel) =>
    setEscolhidos(atual => (atual.some(i => i.chave === item.chave) ? atual.filter(i => i.chave !== item.chave) : [...atual, item]));
  const cancelar = () => { setSelecionando(false); setEscolhidos([]); };
  const n = escolhidos.length;

  const mensagem = janela === 'comentarios' ? mensagemDosComentarios(unico ? [unico] : escolhidos, link) : MENSAGEM_GERAL(link);
  const abrirWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener'); setJanela(null); };
  const abrirEmail = () => {
    const assunto = janela === 'comentarios' ? 'Dúvidas sobre o resumo do contrato de locação' : 'Resumo do contrato de locação';
    window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
    setJanela(null);
  };
  const copiarLink = async () => {
    try { await navigator.clipboard.writeText(link); } catch { /* sem permissão: a pessoa pode copiar o link à mão */ }
    setJanela(null);
    setAviso({ id: Date.now(), title: 'Link copiado', message: 'Agora é só colar onde quiser enviar.' });
  };

  return (
    <PaginaSimples>
      <AvisoFlutuante aviso={aviso} />
      <div className={styles.pagina}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>Resumo de um contrato de locação</h1>
          <p className={styles.lead}>Alguém compartilhou este resumo com você para conferir. Veja o que foi preenchido e o que o sistema sugeriu.</p>
        </header>

        {/* validade do link: informação discreta, com a data real de expiração */}
        <p className={estilos.validade}><Clock size={16} aria-hidden="true" />Este resumo ficará disponível até {data}.</p>

        {/* convite para compartilhar o resumo todo (mesmo card da revisão): independente da seleção */}
        <div className={estilos.compartilhar}>
          <div className={estilos.compartilharTexto}>
            <p className={estilos.compartilharTitulo}>Quer que outra pessoa confira?</p>
            <p className={estilos.compartilharAjuda}>Envie o link do resumo para outra pessoa conferir. Ela poderá ver, mas não editar.</p>
          </div>
          <Button variant="outline" iconLeft={<Share2 size={20} />} onClick={() => setJanela('resumo')}>Compartilhar resumo</Button>
        </div>

        <PainelContrato
          grupos={grupos}
          contrato={r.contrato ?? {}}
          imovel={r.imovel}
          editavel={false}
          quemPreencheu="Preenchido por quem enviou"
          titulo="O que vai no contrato"
          subtitulo="O texto completo das cláusulas só aparece no documento final."
          onComentar={item => { setUnico(item); setJanela('comentarios'); }}
          selecao={selecionando ? { escolhidos: escolhidos.map(i => i.chave), onAlternar: alternar } : undefined}
          abaixoDaLegenda={
            <div className={estilos.convite}>
              {selecionando ? (
                <>
                  <p className={estilos.dica}>Marque as informações sobre as quais quer comentar.</p>
                  <Button variant="ghost" size="sm" onClick={cancelar}>Cancelar seleção</Button>
                </>
              ) : (
                <p className={estilos.dica}>Quer comentar algum ponto?<Button variant="ghost" size="sm" iconLeft={<ListChecks size={16} />} onClick={() => setSelecionando(true)}>Selecionar informações</Button></p>
              )}
            </div>
          }
        />

        {/* a barra acompanha a rolagem enquanto houver algo marcado; no celular, os botões ficam um sobre o outro */}
        {selecionando && n > 0 && (
          <div className={estilos.barra} role="region" aria-label="Informações selecionadas">
            <p className={estilos.contagem} role="status">{n === 1 ? '1 informação selecionada' : `${n} informações selecionadas`}</p>
            <div className={estilos.barraAcoes}>
              <Button variant="ghost" onClick={cancelar}>Cancelar</Button>
              <Button iconLeft={<Share2 size={20} />} onClick={() => { setUnico(null); setJanela('comentarios'); }}>Compartilhar comentários</Button>
            </div>
          </div>
        )}

        {/* fim da página: deixa claro que é um contrato novo, independente deste resumo */}
        <section className={estilos.novo} aria-labelledby="novo-titulo">
          <h2 id="novo-titulo" className={estilos.novoTitulo}>Quer criar seu próprio contrato?</h2>
          <p className={estilos.novoTexto}>Comece um novo preenchimento com suas informações.</p>
          <Button variant="outline" onClick={onNovoContrato}>Criar meu contrato</Button>
        </section>
      </div>

      <Dialog
        open={janela !== null}
        onClose={() => setJanela(null)}
        size="md"
        sheet
        title={janela === 'comentarios' ? 'Compartilhar comentários' : 'Compartilhe o resumo'}
        subtitle={janela === 'comentarios'
          ? 'Escolha como enviar. A mensagem abre pronta para você revisar, e o envio é seu.'
          : 'Envie o link do resumo para outra pessoa conferir. Ela poderá ver, mas não editar.'}
      >
        <div className={estilos.janela}>
          {janela === 'comentarios' && (
            <div>
              <p className={estilos.previaTitulo}>Mensagem</p>
              <pre className={estilos.previa}>{mensagem}</pre>
            </div>
          )}
          <div className={estilos.botoes}>
            <Button variant="outline" iconLeft={<WhatsAppIcone size={20} />} onClick={abrirWhatsApp}>WhatsApp</Button>
            <Button variant="outline" iconLeft={<Mail size={20} />} onClick={abrirEmail}>E-mail</Button>
            {janela === 'resumo' && <Button variant="outline" iconLeft={<Copy size={20} />} onClick={copiarLink}>Copiar link</Button>}
          </div>
        </div>
      </Dialog>
    </PaginaSimples>
  );
}
