/** Quantos dias o resumo ainda fica guardado (o prazo é de 15 dias depois do envio inicial). */
export const PRAZO_DO_RESUMO = 15;

/** "1 dia" ou "N dias". */
export const diasTexto = (n: number): string => (n === 1 ? '1 dia' : `${n} dias`);

/** A data em que o prazo acaba, contando `dias` a partir de hoje (por exemplo, "27 de novembro de 2026"). Calculada na hora, nunca fixa. */
export const dataFinal = (dias: number, hoje: Date = new Date()): string => {
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + dias);
  return fim.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

