/** Máscara e validação simples de telefone (com DDD) e e-mail, usadas nas telas de compartilhar e enviar. */
export const soDigitosContato = (v: string): string => v.replace(/\D/g, '');

/** "11987654321" → "(11) 98765-4321". */
export function formatarTelefone(v: string): string {
  const d = soDigitosContato(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const telefoneValido = (v: string): boolean => [10, 11].includes(soDigitosContato(v).length);
export const emailValido = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Link de exemplo do protótipo. No produto, é gerado ao compartilhar. */
export const LINK_EXEMPLO = 'https://exemplo.com.br/resumo/k7p2-9xqd';
