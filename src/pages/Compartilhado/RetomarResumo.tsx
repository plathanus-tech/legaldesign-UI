import { ResumoContrato, type ResumoContratoProps } from '../Revisar/ResumoContrato';
import { PRAZO_DO_RESUMO } from '../fluxo/dias';

export interface RetomarResumoProps extends ResumoContratoProps {
  /** Quantos dias o resumo ainda fica guardado. O prazo é de 15 dias depois do primeiro envio e diminui com o tempo. Com 2 dias ou menos, a tela mostra um aviso (warning); 0 é o último dia. */
  diasRestantes?: number;
}

/**
 * Tela B: o link da própria pessoa para voltar e editar. Ela chega direto na tela de revisão (2.1), com tudo o que preencheu e
 * as cláusulas padrão, podendo editar, personalizar, compartilhar e seguir. Só se chega a um resumo completo: não existe "resumo
 * com coisa faltando", porque a pessoa só compartilha depois de passar por todas as perguntas. A tela diz por quantos dias o
 * resumo ainda fica guardado (15 dias depois do primeiro envio, então o número só diminui) e o link que ela compartilhar vale só
 * pelo tempo que resta. Depois disso, o resumo é apagado (ver tela C).
 */
export function RetomarResumo({ diasRestantes = PRAZO_DO_RESUMO - 3, ...props }: RetomarResumoProps) {
  return <ResumoContrato {...props} diasRestantes={diasRestantes} />;
}
