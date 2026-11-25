import { api } from './cliente';

export type TipoCategoria = 'COMUM' | 'ECONOMIA' | 'FUNDO_RECOMPENSAS';
export type DestinoAporte = 'RESERVA' | 'FUNDO';

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  orcamentoMensal: number;
  ordem: number;
}

export interface Renda {
  mes: string;
  valor: number;
  herdada: boolean;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoriaId: string;
  data: string;
  observacao: string | null;
}

export interface Aporte {
  id: string;
  destino: DestinoAporte;
  valor: number;
  data: string;
  observacao: string | null;
}

export interface LinhaCategoria {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  orcamento: number;
  gasto: number;
  restante: number;
  estourou: boolean;
  percentual: number;
}

export interface PainelFinanceiro {
  mes: string;
  renda: number;
  totalOrcado: number;
  totalDespesas: number;
  saldoDisponivel: number;
  saldoAposMetas: number;
  reserva: { planejado: number; aportadoNoMes: number; acumulado: number };
  fundo: { planejado: number; aportadoNoMes: number; gastoNoMes: number; saldo: number };
  categorias: LinhaCategoria[];
}

export interface DadosCategoria {
  nome: string;
  orcamentoMensal: number;
}

export interface DadosDespesa {
  descricao: string;
  valor: number;
  categoriaId: string;
  data: string;
  observacao: string;
}

export interface DadosAporte {
  destino: DestinoAporte;
  valor: number;
  data: string;
  observacao: string;
}

// ---------- categorias ----------
export const listarCategorias = () => api<Categoria[]>('/api/categorias');

export const criarCategoria = (dados: DadosCategoria) =>
  api<Categoria>('/api/categorias', { metodo: 'POST', corpo: dados });

export const atualizarCategoria = (id: string, dados: DadosCategoria) =>
  api<Categoria>(`/api/categorias/${id}`, { metodo: 'PUT', corpo: dados });

export const excluirCategoria = (id: string) =>
  api<void>(`/api/categorias/${id}`, { metodo: 'DELETE' });

// ---------- renda e painel ----------
export const buscarRenda = (mes: string) => api<Renda>(`/api/renda?mes=${mes}`);

export const definirRenda = (mes: string, valor: number) =>
  api<Renda>(`/api/renda/${mes}`, { metodo: 'PUT', corpo: { valor } });

export const buscarPainelFinanceiro = (mes: string) =>
  api<PainelFinanceiro>(`/api/financas/painel?mes=${mes}`);

// ---------- despesas ----------
export function listarDespesas(mes: string, categoriaId: string | null) {
  const filtro = categoriaId ? `&categoriaId=${categoriaId}` : '';
  return api<Despesa[]>(`/api/despesas?mes=${mes}${filtro}`);
}

export const lancarDespesa = (dados: DadosDespesa) =>
  api<Despesa>('/api/despesas', { metodo: 'POST', corpo: dados });

export const atualizarDespesa = (id: string, dados: DadosDespesa) =>
  api<Despesa>(`/api/despesas/${id}`, { metodo: 'PUT', corpo: dados });

export const excluirDespesa = (id: string) =>
  api<void>(`/api/despesas/${id}`, { metodo: 'DELETE' });

// ---------- aportes ----------
export const listarAportes = (mes: string) => api<Aporte[]>(`/api/aportes?mes=${mes}`);

export const registrarAporte = (dados: DadosAporte) =>
  api<Aporte>('/api/aportes', { metodo: 'POST', corpo: dados });

export const excluirAporte = (id: string) =>
  api<void>(`/api/aportes/${id}`, { metodo: 'DELETE' });