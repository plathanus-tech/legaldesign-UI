import { Banknote, FileText, Hammer, Handshake, House, ShieldCheck, Users, type LucideIcon } from 'lucide-react';

/** Um ícone para cada assunto do contrato, usado no resumo ao lado do formulário e na tela de revisão. */
const ICONES: Record<string, LucideIcon> = {
  imovel: House,
  pessoas: Users,
  valores: Banknote,
  convivencia: Handshake,
  reparos: Hammer,
  saida: ShieldCheck,
  padrao: FileText,
};

/** Ícone decorativo do assunto (o nome do assunto sempre aparece em texto ao lado). */
export function IconeGrupo({ id, size = 16, className }: { id: string; size?: number; className?: string }) {
  const Icone = ICONES[id] ?? FileText;
  return <Icone size={size} aria-hidden="true" className={className} />;
}
