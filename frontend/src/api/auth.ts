import { api } from './cliente';
import type { AuthResposta, Usuario } from './tipos';

export function login(email: string, senha: string): Promise<AuthResposta> {
  return api<AuthResposta>('/api/auth/login', {
    metodo: 'POST',
    corpo: { email, senha },
    autenticada: false,
  });
}

export function cadastrarUsuario(nome: string, email: string, senha: string): Promise<AuthResposta> {
  return api<AuthResposta>('/api/auth/registro', {
    metodo: 'POST',
    corpo: { nome, email, senha },
    autenticada: false,
  });
}

export function buscarUsuarioAtual(): Promise<Usuario> {
  return api<Usuario>('/api/me');
}