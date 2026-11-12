/** Máscaras e validações simples de documentos e CEP (só dígitos + dígitos verificadores). */
export const soDigitos = (v: string): string => v.replace(/\D/g, '');

export function formatarCpf(v: string): string {
  const d = soDigitos(v).slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function formatarCnpj(v: string): string {
  const d = soDigitos(v).slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}

export const formatarCep = (v: string): string => soDigitos(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');

function digito(base: number[], pesos: number[]): number {
  const soma = base.reduce((acc, n, i) => acc + n * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(v: string): boolean {
  const d = soDigitos(v);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const n = d.split('').map(Number);
  return digito(n.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]) === n[9] && digito(n.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) === n[10];
}

export function cnpjValido(v: string): boolean {
  const d = soDigitos(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const n = d.split('').map(Number);
  return digito(n.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === n[12] && digito(n.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === n[13];
}

export interface EnderecoPorCep { logradouro: string; bairro: string; cidade: string; uf: string }

/**
 * Busca o endereço de um CEP no ViaCEP (serviço público e gratuito). Só o CEP sai do navegador, nenhum outro dado.
 * Devolve `null` se o CEP não existir. Lança erro se a consulta falhar (sem internet, serviço fora do ar).
 */
export async function buscarEnderecoPorCep(cep: string, sinal?: AbortSignal): Promise<EnderecoPorCep | null> {
  const d = soDigitos(cep);
  const resp = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: sinal });
  if (!resp.ok) throw new Error('falha-cep');
  const j = (await resp.json()) as { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
  if (j.erro) return null;
  return { logradouro: j.logradouro ?? '', bairro: j.bairro ?? '', cidade: j.localidade ?? '', uf: j.uf ?? '' };
}
