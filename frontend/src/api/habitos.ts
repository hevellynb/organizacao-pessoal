import { api } from './cliente';

export interface Habito {
  id: string;
  nome: string;
  descricao: string | null;
  metaDescricao: string | null;
  metaDiasMes: number;
}

export interface HabitoDia {
  id: string;
  nome: string;
  metaDescricao: string | null;
  feito: boolean;
  diasNoMes: number;
  metaDiasMes: number;
}

export interface HabitoResumoMes {
  id: string;
  nome: string;
  metaDiasMes: number;
  diasRealizados: number;
  percentual: number;
  diasDoMes: number[];
}

export interface HistoricoMes {
  mes: string;
  dias: number;
}

export interface DadosHabito {
  nome: string;
  descricao: string;
  metaDescricao: string;
  metaDiasMes: number;
}

export const listarHabitos = () => api<Habito[]>('/api/habitos');

export const buscarListaDoDia = (dia: string) => api<HabitoDia[]>(`/api/habitos/dia?data=${dia}`);

export const buscarResumoDoMes = (mes: string) =>
  api<HabitoResumoMes[]>(`/api/habitos/resumo?mes=${mes}`);

export const buscarHistorico = (id: string) => api<HistoricoMes[]>(`/api/habitos/${id}/historico`);

export const criarHabito = (dados: DadosHabito) =>
  api<Habito>('/api/habitos', { metodo: 'POST', corpo: dados });

export const atualizarHabito = (id: string, dados: DadosHabito) =>
  api<Habito>(`/api/habitos/${id}`, { metodo: 'PUT', corpo: dados });

export const excluirHabito = (id: string) => api<void>(`/api/habitos/${id}`, { metodo: 'DELETE' });

export const marcarHabito = (id: string, dia: string, feito: boolean) =>
  api<void>(`/api/habitos/${id}/registros/${dia}`, { metodo: 'PUT', corpo: { feito } });