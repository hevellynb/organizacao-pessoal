export interface Usuario {
  id: string;
  nome: string;
  email: string;
  apelido: string | null;
  corDestaque: string;
}

export interface AuthResposta {
  token: string;
  usuario: Usuario;
}