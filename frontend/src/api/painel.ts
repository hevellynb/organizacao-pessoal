import { api } from './cliente';
import type { PainelFinanceiro } from './financas';
import type { ItemDesejo } from './recompensas';

export interface PainelGeral {
  mes: string;
  habitos: { habitos: number; diasRealizados: number; metaTotalDias: number; percentual: number };
  bingo: {
    celulasDefinidas: number;
    celulasConcluidas: number;
    linhas: number;
    cartelaCompleta: boolean;
    pontosDoMes: number;
  };
  saldoPontos: number;
  financas: PainelFinanceiro;
  recompensasDisponiveis: ItemDesejo[];
}

export function buscarPainel(mes: string) {
  return api<PainelGeral>(`/api/painel?mes=${mes}`);
}