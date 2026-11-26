import { api } from './cliente';

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';
export type StatusItem = 'PENDENTE' | 'ADQUIRIDO';

export interface ItemDesejo {
  id: string;
  nome: string;
  descricao: string | null;
  precoEstimado: number;
  pontosNecessarios: number;
  prioridade: Prioridade;
  status: StatusItem;
  adquiridoEm: string | null;
  pontosSuficientes: boolean;
  fundoSuficiente: boolean;
  disponivelParaResgate: boolean;
}

export interface ListaDesejos {
  mes: string;
  saldoPontos: number;
  fundoDisponivel: number;
  itens: ItemDesejo[];
}

export interface DadosItem {
  nome: string;
  descricao: string;
  precoEstimado: number;
  pontosNecessarios: number | null; // null = o backend sugere pela tabela do documento
  prioridade: Prioridade;
}

export interface ResultadoResgate {
  item: ItemDesejo;
  pontosGastos: number;
  saldoPontos: number;
  valorLancado: number;
  fundoDisponivel: number;
}

export const buscarDesejos = () => api<ListaDesejos>('/api/wishlist');

export const criarItem = (dados: DadosItem) =>
  api<ItemDesejo>('/api/wishlist', { metodo: 'POST', corpo: dados });

export const atualizarItem = (id: string, dados: DadosItem) =>
  api<ItemDesejo>(`/api/wishlist/${id}`, { metodo: 'PUT', corpo: dados });

export const excluirItem = (id: string) => api<void>(`/api/wishlist/${id}`, { metodo: 'DELETE' });

export const resgatarItem = (id: string, precoPago: number | null) =>
  api<ResultadoResgate>(`/api/wishlist/${id}/resgatar`, {
    metodo: 'POST',
    corpo: { precoPago },
  });