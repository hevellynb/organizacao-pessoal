export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface AuthResposta {
  token: string;
  usuario: Usuario;
}