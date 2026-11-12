import { useState } from 'react';
import { ArrowRight, CreditCard, ShieldCheck, UserRoundX } from 'lucide-react';
import { Accordion, AppHeader, Button, Dialog, Feedback, Tooltip } from '../../index';
import ilustracaoLocacao from '../../assets/ilustracao-locacao.svg';
import { RespostaDoFaq, detectInAppBrowser } from './Apresentacao';
import { ComoFuncionaFluxo } from './ComoFuncionaFluxo';
import { FACILIDADES, FAQ, ATUALIZADO_EM_PADRAO, INSTAGRAM_URL, NOME_DA_MARCA } from './content';
import { IconeInstagram } from './IconeInstagram';
import { ModelCard } from './ModelCard';
import { PalcoDoHero } from './PalcoDoHero';
import base from './Apresentacao.module.css';
import styles from './ApresentacaoV3.module.css';

export interface ApresentacaoV3Props {
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
 * Tela 0, versão 3: mistura a v1 com a v2. Fica na estrutura da v1 (introdução compacta dentro do conteúdo, com o texto e os três fatos
 * à esquerda e a ilustração à direita, e o modelo logo abaixo), sem o fundo colorido do hero da v2: só um brilho verde bem suave por trás
 * da ilustração. A ilustração é a da v2 (o documento com os cartões de ícones) e o título leva o destaque em verde. Mesmo conteúdo das outras versões.
 */
export function ApresentacaoV3({ onStart, atualizadoEm = ATUALIZADO_EM_PADRAO, atualizacao = null, inAppBrowser }: ApresentacaoV3Props) {
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

      <main className={base.main}>
        <div className={base.content}>
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
            <div className={styles.esquerda}>
              <div className={styles.texto}>
                <h1 className={styles.h1}>
                  Contratos atualizados, que você <span className={styles.destaque}>entende de verdade</span>
                </h1>
                <p className={styles.lead}>Modelos desenvolvidos com conhecimento jurídico e organizados para facilitar o preenchimento e a compreensão.</p>
                <div className={styles.acoes}>
                  <Button iconRight={<ArrowRight size={20} />} onClick={iniciar}>Começar a preencher</Button>
                </div>
              </div>

              <ul className={styles.pilares}>
                {FACILIDADES.map(f => {
                  const Icone = ICONES[f.id];
                  return (
                    <li key={f.id} className={styles.pilar}>
                      <p className={styles.pilarTitulo}><Icone size={20} aria-hidden="true" />{f.titulo}</p>
                      <p className={styles.pilarTexto}>{f.texto}</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.arte}><PalcoDoHero brilho icones /></div>
          </header>

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
