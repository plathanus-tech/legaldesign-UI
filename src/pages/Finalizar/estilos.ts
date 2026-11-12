/**
 * Os estilos do contrato (o layout do PDF) e o valor de cada um. Cada estilo tem o seu valor, e é o valor do estilo escolhido que
 * aparece no pagamento. Os valores abaixo são marcadores: o cliente ainda não definiu quanto custa cada estilo. Quando definir,
 * basta trocar aqui.
 */
export type EstiloId = 'classico' | 'moderno' | 'minimalista';

export interface EstiloDoContrato {
  valor: EstiloId;
  titulo: string;
  descricao: string;
  /** Valor do contrato neste estilo, já formatado (ex.: "R$ 49,90"). */
  preco: string;
}

export const MARCADOR_DE_VALOR = 'R$ 00,00';

export const ESTILOS: EstiloDoContrato[] = [
  { valor: 'classico', titulo: 'Clássico', descricao: 'Texto corrido, com aparência tradicional.', preco: MARCADOR_DE_VALOR },
  { valor: 'moderno', titulo: 'Moderno', descricao: 'Ícones, destaques e blocos explicativos', preco: MARCADOR_DE_VALOR },
  { valor: 'minimalista', titulo: 'Minimalista', descricao: 'Visual leve, poucos elementos e leitura fácil.', preco: MARCADOR_DE_VALOR },
];

export const estiloPorId = (id?: string | null): EstiloDoContrato | undefined => ESTILOS.find(e => e.valor === id);
/** Valor do estilo escolhido; sem estilo, o marcador. */
export const precoDoEstilo = (id?: string | null): string => estiloPorId(id)?.preco ?? MARCADOR_DE_VALOR;
