import { api } from './cliente';
import type { Usuario } from './tipos';

export interface DadosPreferencias {
  apelido: string;
  corDestaque: string;
}

export const atualizarPreferencias = (dados: DadosPreferencias) =>
  api<Usuario>('/api/me/preferencias', { metodo: 'PUT', corpo: dados });