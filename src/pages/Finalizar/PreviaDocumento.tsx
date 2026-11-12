import { Banknote, Calendar, House, Info, UserRound, Users } from 'lucide-react';
import type { EstiloId } from './estilos';
import styles from './PreviaDocumento.module.css';

/**
 * Parte da primeira folha do documento, no estilo escolhido, para a pessoa ver como ele fica. Os títulos e a organização
 * aparecem de verdade; o texto das cláusulas e os dados ficam borrados e não podem ser selecionados, para ninguém copiar o conteúdo.
 * Os títulos de seção são um exemplo: precisam ser trocados pelos do modelo real do contrato. Se a pessoa já enviou o logo,
 * ele aparece no alto.
 */
export function PreviaDocumento({ estilo, logoUrl }: { estilo: EstiloId; logoUrl?: string }) {
  return (
    <div className={styles.moldura}>
      <div className={`${styles.folha} ${styles[estilo]}`} aria-label="Exemplo do documento, com o texto oculto" role="img">
        {estilo === 'classico' && <Classico logoUrl={logoUrl} />}
        {estilo === 'moderno' && <Moderno logoUrl={logoUrl} />}
        {estilo === 'minimalista' && <Minimalista logoUrl={logoUrl} />}
      </div>
      <p className={styles.nota}>Exemplo ilustrativo. O texto das cláusulas e os dados ficam ocultos nesta prévia.</p>
    </div>
  );
}

/** Texto que não pode ser lido: borrado, sem seleção e fora do leitor de tela. */
function Borrado({ linhas = 3, curto = false }: { linhas?: number; curto?: boolean }) {
  const frase = 'Texto do contrato, oculto nesta prévia. ';
  return <p className={`${styles.borrado} ${curto ? styles.borradoCurto : ''}`} aria-hidden="true">{frase.repeat(linhas * 2)}</p>;
}

const SECOES = ['Das partes', 'Do imóvel', 'Do prazo', 'Do valor e do pagamento'];

function Logo({ url }: { url?: string }) {
  return url ? <img src={url} alt="" className={styles.logo} /> : null;
}

function Classico({ logoUrl }: { logoUrl?: string }) {
  return (
    <>
      <div className={styles.cTopo}>
        <Logo url={logoUrl} />
        <h4 className={styles.cTitulo}>Contrato de locação de imóvel</h4>
        <p className={styles.cSub}>Instrumento particular</p>
      </div>
      {SECOES.map((s, i) => (
        <section key={s} className={styles.cSecao}>
          <h5 className={styles.cHeading}>Cláusula {i + 1}ª - {s}</h5>
          <Borrado linhas={4} />
        </section>
      ))}
    </>
  );
}

const RESUMO = [
  { rotulo: 'Locador', Icone: UserRound },
  { rotulo: 'Quem aluga', Icone: Users },
  { rotulo: 'Imóvel', Icone: House },
  { rotulo: 'Aluguel', Icone: Banknote },
];

function Moderno({ logoUrl }: { logoUrl?: string }) {
  const icones = [UserRound, House, Calendar, Banknote];
  return (
    <>
      <header className={styles.mCabeca}>
        {logoUrl ? <img src={logoUrl} alt="" className={styles.logo} /> : <span className={styles.mMarca} aria-hidden="true" />}
        <div>
          <h4 className={styles.mTitulo}>Contrato de locação de imóvel</h4>
          <p className={styles.mSub}>Resumo e cláusulas</p>
        </div>
      </header>

      <div className={styles.mResumo}>
        {RESUMO.map(({ rotulo, Icone }, i) => (
          <div key={rotulo} className={`${styles.mBloco} ${i === 3 ? styles.mDestaque : ''}`}>
            <Icone size={16} aria-hidden="true" />
            <span className={styles.mRotulo}>{rotulo}</span>
            <span className={styles.mValor} aria-hidden="true">Dado oculto</span>
          </div>
        ))}
      </div>

      <aside className={styles.mCallout}>
        <Info size={16} aria-hidden="true" />
        <div><strong className={styles.mCalloutTitulo}>Em resumo</strong><Borrado linhas={2} /></div>
      </aside>

      {SECOES.map((s, i) => {
        const Icone = icones[i];
        return (
          <section key={s} className={styles.mSecao}>
            <span className={styles.mIcone} aria-hidden="true"><Icone size={16} /></span>
            <div>
              <h5 className={styles.mHeading}>{s}</h5>
              <Borrado linhas={3} />
            </div>
          </section>
        );
      })}
    </>
  );
}

function Minimalista({ logoUrl }: { logoUrl?: string }) {
  return (
    <>
      <header className={styles.nTopo}>
        <Logo url={logoUrl} />
        <h4 className={styles.nTitulo}>Contrato de locação de imóvel</h4>
      </header>
      <hr className={styles.nRegua} />
      {SECOES.map(s => (
        <section key={s} className={styles.nSecao}>
          <h5 className={styles.nHeading}>{s}</h5>
          <Borrado linhas={2} />
        </section>
      ))}
    </>
  );
}
