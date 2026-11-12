import type { ReactNode } from 'react';
import { Ban, Bell, Landmark, Receipt, Wallet, Building2, FileCheck, FileText, Hammer, Handshake, Home, PawPrint, Percent, Scale, TriangleAlert, User, ClipboardCheck } from 'lucide-react';

/**
 * Ícones das alternativas das cláusulas padrão, com o mesmo significado em todas as janelas de "Personalizar":
 * quem arca com o custo (casa = proprietário, pessoa = quem está alugando), índice (porcentagem), atenção (alerta),
 * proibido (círculo cortado), combinado entre as partes (aperto de mão), regra do condomínio (prédio) etc.
 * A primeira regra que combina com o título vale; sem nenhuma, usa o ícone de texto.
 */
const REGRAS: Array<[RegExp, ReactNode]> = [
  [/urgência/i, <TriangleAlert />],
  [/^Quem está alugando só avisa/, <Bell />],
  // impostos e taxas: cada nível de quanto quem está alugando paga tem o seu ícone (imposto, imposto + taxas, tudo)
  [/paga o IPTU e as taxas/, <Receipt />],
  [/paga o IPTU/, <Landmark />],
  [/paga todos$/, <Wallet />],
  [/^(O proprietário|Ficam por conta do proprietário)/, <Home />],
  [/^Quem está alugando/, <User />],
  [/^(IGP-M|IPCA)$/, <Percent />],
  [/^(Não pode|Nunca)/, <Ban />],
  [/^Pode ter animais/, <PawPrint />],
  [/autorização por escrito/, <FileCheck />],
  [/descumprido/, <Scale />],
  [/regulamento do condomínio/, <Building2 />],
  [/combinados/, <Handshake />],
  [/piorou/, <ClipboardCheck />],
  [/danos por descuido/, <Hammer />],
];

export const iconeDaOpcao = (titulo: string): ReactNode => REGRAS.find(([re]) => re.test(titulo))?.[1] ?? <FileText />;
