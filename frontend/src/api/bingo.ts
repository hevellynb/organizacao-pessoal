import { api } from './cliente';

export type TipoCelula = 'HABITO' | 'FINANCEIRA' | 'MANUAL';
export type TipoLancamento = 'GANHO_BINGO' | 'RESGATE' | 'AJUSTE';

export interface CelulaCartela {
  posicao: number;
  definida: boolean;
  titulo: string | null;
  tipo: TipoCelula | null;
  habitoId: string | null;
  metaDias: number | null;
  categoriaId: string | null;
  concluida: boolean;
  atual: number | null;
  meta: number | null;
  unidade: 'DIAS' | 'REAIS' | null;
  regra: 'META_APORTE' | 'LIMITE_GASTO' | null;
}

export interface Cartela {
  id: string | null;
  mes: string;
  fechada: boolean;
  celulas: CelulaCartela[];
  linhasCompletas: number[][];
  quantidadeLinhas: number;
  cartelaCompleta: boolean;
  pontosDoMes: number;
  saldoPontos: number;
}

export interface DadosCelula {
  titulo: string;
  tipo: TipoCelula;
  habitoId: string | null;
  metaDias: number | null;
  categoriaId: string | null;
}

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  pontos: number;
  descricao: string | null;
  criadoEm: string;
}

export interface Pontos {
  saldo: number;
  extrato: Lancamento[];
}

export interface Regras {
  pontosPorLinha: number;
  bonusCartela: number;
}

export const buscarCartela = (mes: string) => api<Cartela>(`/api/bingo?mes=${mes}`);

export const definirCelula = (mes: string, posicao: number, dados: DadosCelula) =>
  api<Cartela>(`/api/bingo/${mes}/celulas/${posicao}`, { metodo: 'PUT', corpo: dados });

export const limparCelula = (mes: string, posicao: number) =>
  api<Cartela>(`/api/bingo/${mes}/celulas/${posicao}`, { metodo: 'DELETE' });

export const concluirCelulaManual = (mes: string, posicao: number, concluida: boolean) =>
  api<Cartela>(`/api/bingo/${mes}/celulas/${posicao}/conclusao`, {
    metodo: 'PUT',
    corpo: { concluida },
  });

export const buscarPontos = () => api<Pontos>('/api/pontos');

export const buscarRegras = () => api<Regras>('/api/pontos/regras');

export const atualizarRegras = (regras: Regras) =>
  api<Regras>('/api/pontos/regras', { metodo: 'PUT', corpo: regras });