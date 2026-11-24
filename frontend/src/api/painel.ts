import { api } from './cliente';

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
  financas: {
    renda: number;
    totalDespesas: number;
    saldoDisponivel: number;
    saldoAposMetas: number;
  };
  recompensasDisponiveis: {
    id: string;
    nome: string;
    precoEstimado: number;
    pontosNecessarios: number;
  }[];
}

export function buscarPainel(mes: string): Promise<PainelGeral> {
  return api<PainelGeral>(`/api/painel?mes=${mes}`);
}