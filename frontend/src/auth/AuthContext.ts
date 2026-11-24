import { createContext } from 'react';
import type { Usuario } from '../api/tipos';

export interface AuthContextoValor {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

export const AuthContext = createContext<AuthContextoValor | null>(null);