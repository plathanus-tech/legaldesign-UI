import { useState } from 'react';
import { ArrowRight, CreditCard, ShieldCheck, UserRoundX } from 'lucide-react';
import { Accordion, AppHeader, Button, Dialog, Feedback, Tooltip } from '../../index';
import ilustracaoLocacao from '../../assets/ilustracao-locacao.svg';
import { RespostaDoFaq, detectInAppBrowser } from './Apresentacao';
import { ComoFuncionaFluxo } from './ComoFuncionaFluxo';
import { DocumentSketch } from './DocumentSketch';
import { FACILIDADES, FAQ, ATUALIZADO_EM_PADRAO, INSTAGRAM_URL, NOME_DA_MARCA } from './content';
import { IconeInstagram } from './IconeInstagram';
import { ModelCard } from './ModelCard';
import base from './Apresentacao.module.css';
import styles from './ApresentacaoV2.module.css';

export interface ApresentacaoV2Props {
  /** Chamado ao clicar em "Começar a preencher": vai direto ao formulário (tela 1.1). */
  onStart?: () => void;
  atualizadoEm?: string | null;
  atualizacao?: string | null;
  /** Força o aviso do navegador interno do Instagram. Sem valor, é detectado pelo user agent. */
  inAppBrowser?: boolean;
}

type Painel = 'como-funciona' | 'ajuda' | null;

const ICONES = { 'sem-cadastro': UserRoundX, pagamento: CreditCard, protegidos: ShieldCheck } as const;

/**
 * Tela 0, versão 2: a mesma apresentação, com cara de landing. Só usa os conteúdos que a tela já tem (título, subtítulo, os três fatos,
 * o modelo e o botão): o que muda é o jeito de mostrar. O destaque está no hero, com um fundo em degradê de cores da marca e de apoio,
 * detalhes de tipografia (uma palavra em degradê com um sublinhado e uma pílula com ícone dentro do título) e uma composição de cartões
 * translúcidos com ícones e a miniatura de um documento (sem texto de cláusula). Os fatos viram três cartões com cor própria.
 */
export function ApresentacaoV2({ onStart, atualizadoEm = ATUALIZADO_EM_PADRAO, atualizacao = null, inAppBrowser }: ApresentacaoV2Props) {
  const [painel, setPainel] = useState<Painel>(null);
  const [bannerFechado, setBannerFechado] = useState(false);
  const mostrarBanner = (inAppBrowser ?? detectInAppBrowser()) && !bannerFechado;
  const fechar = () => setPainel(null);
  const iniciar = () => onStart?.();

  return (
    <div className={base.page}>
      <div className={base.header}>
        <AppHeader
          align="start"
          logo={<span className={base.brand}>Marca</span>}
          actions={
            <>
              <Button variant="ghost" onClick={() => setPainel('como-funciona')}>Como funciona</Button>
              <Button variant="ghost" onClick={() => setPainel('ajuda')}>Ajuda</Button>
              <Tooltip content="Instagram" placement="bottom">
                <a className={base.rede} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`Instagram da ${NOME_DA_MARCA} (abre em nova aba)`}>
                  <IconeInstagram size={20} />
                </a>
              </Tooltip>
            </>
          }
        />
      </div>

      {mostrarBanner && (
        <div className={styles.aviso}>
          <Feedback
            type="warning"
            title="Abra no seu navegador"
            message="Para pagar e baixar seu contrato sem problemas, abra esta página no navegador do celular (menu ⋯ › Abrir no navegador)."
            dismissible
            onDismiss={() => setBannerFechado(true)}
          />
        </div>
      )}

      {/* O fundo ocupa a largura toda, colado no cabeçalho; o conteúdo do hero fica na mesma largura do resto da página */}
      <section className={styles.hero} aria-labelledby="titulo-da-pagina">
        <div className={styles.fundo} aria-hidden="true" />
        <div className={styles.heroInterno}>
          <div className={styles.texto}>
            <h1 className={styles.h1} id="titulo-da-pagina">
              Contratos atualizados, que você{' '}
              <span className={styles.destaque}>entende de verdade</span>
            </h1>
            <p className={styles.lead}>Modelos desenvolvidos com conhecimento jurídico e organizados para facilitar o preenchimento e a compreensão.</p>
            <div className={styles.acoes}>
              <Button iconRight={<ArrowRight size={20} />} onClick={iniciar}>Começar a preencher</Button>
            </div>
          </div>

          {/* Composição decorativa: o documento em destaque (só barras, sem texto de cláusula) e cartões pequenos com ícones */}
          <div className={styles.palco} aria-hidden="true">
            <div className={`${styles.cartao} ${styles.documento}`}><DocumentSketch variant="visual-law" /></div>
            <div className={`${styles.cartao} ${styles.icone} ${styles.verde}`}><ShieldCheck size={24} /></div>
            <div className={`${styles.cartao} ${styles.icone} ${styles.azul}`}><CreditCard size={24} /></div>
            <div className={`${styles.cartao} ${styles.icone} ${styles.amarelo}`}><UserRoundX size={24} /></div>
          </div>
        </div>

        {/* os três fatos ficam sobre o fundo do hero, que some no fim, até a cor de fundo da página */}
        <div className={styles.fatosWrap}>
          <ul className={styles.fatos}>
            {FACILIDADES.map(f => {
              const Icone = ICONES[f.id];
              return (
                <li key={f.id} className={styles.fato}>
                  <span className={styles.fatoIcone} aria-hidden="true"><Icone aria-hidden="true" /></span>
                  <div className={styles.fatoCorpo}>
                    <p className={styles.fatoTitulo}>{f.titulo}</p>
                    <p className={styles.fatoTexto}>{f.texto}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <main className={styles.principal}>
        <div className={base.content}>

          <section aria-label="Modelos disponíveis" className={base.catalog}>
            <div className={base.grid}>
              <ModelCard
                nome="Contrato de locação de imóvel"
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

      <Dialog open={painel === 'como-funciona'} onClose={fechar} title="Como funciona" subtitle="Veja como funciona a criação do seu documento." size="md">
        <ComoFuncionaFluxo />
      </Dialog>
      <Dialog open={painel === 'ajuda'} onClose={fechar} title="Ajuda" subtitle="Dúvidas frequentes" size="md">
        <Accordion variant="lines" headingLevel={3} items={FAQ.map(f => ({ title: f.title, content: <RespostaDoFaq resposta={f} /> }))} />
      </Dialog>
    </div>
  );
}
