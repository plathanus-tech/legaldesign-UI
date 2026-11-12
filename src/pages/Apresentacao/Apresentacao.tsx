import { useState } from 'react';
import { CreditCard, ShieldCheck, UserRoundX } from 'lucide-react';
import { Accordion, AppHeader, Button, Dialog, Feedback, Tooltip } from '../../index';
import ilustracaoLocacao from '../../assets/ilustracao-locacao.svg';
import { ComoFuncionaFluxo } from './ComoFuncionaFluxo';
import { LegalDesignIllustration } from './LegalDesignIllustration';
import { ESTILOS } from '../Finalizar/estilos';
import { ModelCard } from './ModelCard';
import { FACILIDADES, FAQ, ATUALIZADO_EM_PADRAO, INSTAGRAM_URL, NOME_DA_MARCA } from './content';
import { IconeInstagram } from './IconeInstagram';
import styles from './Apresentacao.module.css';

export interface ApresentacaoProps {
  /** Chamado ao clicar em "Conhecer modelo": vai direto ao formulário (tela 1.1, Tipo de locação). */
  onStart?: () => void;
  /** Data da última atualização do modelo ("Última atualização em …"). `null` oculta a data. */
  atualizadoEm?: string | null;
  /** Atualização jurídica relevante, em linguagem simples e validada pela equipe. Sem valor, não aparece. */
  atualizacao?: string | null;
  /** Força o aviso do navegador interno do Instagram. Sem valor, é detectado pelo user agent. */
  inAppBrowser?: boolean;
}

type Painel = 'como-funciona' | 'ajuda' | null;

const FACILIDADE_ICONES = { 'sem-cadastro': UserRoundX, pagamento: CreditCard, protegidos: ShieldCheck } as const;

export function detectInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Instagram|FBAN|FBAV/i.test(navigator.userAgent);
}

/**
 * Tela 0: página inicial. Apresenta a proposta (hero compacto) e os modelos disponíveis; o botão do modelo
 * leva direto ao formulário. Não é landing page. "Como funciona" e "Ajuda" abrem em painéis.
 */
/** Resposta do FAQ: parágrafos e, quando há, um subtítulo com lista e uma frase final. */
export function RespostaDoFaq({ resposta }: { resposta: { content: string; extra?: { titulo: string; itens: readonly string[]; fim: string } } }) {
  return (
    <div className={styles.resposta}>
      {resposta.content.split('\n').map(p => <p key={p} className={styles.text}>{p}</p>)}
      {resposta.extra && (
        <>
          <p className={styles.respostaTitulo}>{resposta.extra.titulo}</p>
          <ul className={styles.respostaLista}>{resposta.extra.itens.map(i => <li key={i} className={styles.text}>{i}</li>)}</ul>
          <p className={styles.text}>{resposta.extra.fim}</p>
        </>
      )}
    </div>
  );
}

export function Apresentacao({
  onStart, atualizadoEm = ATUALIZADO_EM_PADRAO, atualizacao = null, inAppBrowser,
}: ApresentacaoProps) {
  const [painel, setPainel] = useState<Painel>(null);
  const [bannerFechado, setBannerFechado] = useState(false);
  const mostrarBanner = (inAppBrowser ?? detectInAppBrowser()) && !bannerFechado;

  const fechar = () => setPainel(null);
  const iniciar = () => onStart?.();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <AppHeader
          align="start"
          logo={<span className={styles.brand}>Marca</span>}
          actions={
            <>
              <Button variant="ghost" onClick={() => setPainel('como-funciona')}>Como funciona</Button>
              <Button variant="ghost" onClick={() => setPainel('ajuda')}>Ajuda</Button>
              {/* Só nesta tela inicial: no formulário, um link externo tiraria a pessoa do preenchimento. Abre em outra aba. */}
              <Tooltip content="Instagram" placement="bottom">
                <a className={styles.rede} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`Instagram da ${NOME_DA_MARCA} (abre em nova aba)`}>
                  <IconeInstagram size={20} />
                </a>
              </Tooltip>
            </>
          }
        />
      </div>

      <main className={styles.main}>
        <div className={styles.content}>
          {mostrarBanner && (
            <Feedback
              type="warning"
              title="Abra no seu navegador"
              message="Para pagar e baixar seu contrato sem problemas, abra esta página no navegador do celular (menu ⋯ › Abrir no navegador)."
              dismissible
              onDismiss={() => setBannerFechado(true)}
            />
          )}

          <header className={styles.intro}>
            {/* No desktop, título, subtítulo e os três itens formam um bloco só, centralizado na altura da ilustração */}
            <div className={styles.introLeft}>
            <div className={styles.introText}>
              <h1 className={styles.h1}>Contratos atualizados, que você entende de verdade</h1>
              <p className={styles.lead}>
                Modelos desenvolvidos com conhecimento jurídico e organizados para facilitar o preenchimento e a compreensão.
              </p>
            </div>
            <ul className={styles.pillars}>
              {FACILIDADES.map(f => {
                const Icone = FACILIDADE_ICONES[f.id];
                return (
                  <li key={f.id} className={styles.pillar}>
                    <p className={styles.pillarTitle}><Icone size={20} aria-hidden="true" />{f.titulo}</p>
                    <p className={styles.pillarText}>{f.texto}</p>
                  </li>
                );
              })}
            </ul>
            </div>
            <div className={styles.art}><LegalDesignIllustration /></div>

          </header>

          {/* Sem título visível; o nome da região segue disponível para leitores de tela */}
          <section aria-label="Modelos disponíveis" className={styles.catalog}>
            <div className={styles.grid}>
              <ModelCard
                nome="Contrato de locação de imóvel"
                valores={ESTILOS.map(e => ({ rotulo: e.titulo, valor: e.preco }))}
                descricao="Formalize a locação do seu imóvel com um contrato organizado e fácil de compreender."
                detalhes={['Para quem vai alugar ou para corretores', 'Você revisa tudo antes de pagar', 'Receba em PDF']}
                atualizacao={atualizacao}
                fundamento="De acordo com a lei e as decisões do STJ"
                atualizadoEm={atualizadoEm}
                ilustracao={<img src={ilustracaoLocacao} alt="" />}
                acao="Começar a preencher"
                onAction={iniciar}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Como funciona */}
      <Dialog
        open={painel === 'como-funciona'}
        onClose={fechar}
        title="Como funciona"
        subtitle="Veja como funciona a criação do seu documento."
        size="md"
      >
        <ComoFuncionaFluxo />
      </Dialog>

      {/* Ajuda */}
      <Dialog
        open={painel === 'ajuda'}
        onClose={fechar}
        title="Ajuda"
        subtitle="Dúvidas frequentes"
        size="md"
      >
        <Accordion variant="lines" headingLevel={3} items={FAQ.map(f => ({ title: f.title, content: <RespostaDoFaq resposta={f} /> }))} />
      </Dialog>
    </div>
  );
}
