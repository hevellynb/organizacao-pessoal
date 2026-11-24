const URL_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const CHAVE_TOKEN = 'organizacao.token';

export const tokenStorage = {
  ler: (): string | null => localStorage.getItem(CHAVE_TOKEN),
  gravar: (token: string): void => localStorage.setItem(CHAVE_TOKEN, token),
  limpar: (): void => localStorage.removeItem(CHAVE_TOKEN),
};

export class ApiError extends Error {
  status: number;
  campos?: Record<string, string>;

  constructor(status: number, mensagem: string, campos?: Record<string, string>) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

// O AuthProvider registra aqui o que fazer quando o servidor disser "sessão inválida" (401)
let aoExpirarSessao: (() => void) | null = null;
export function registrarAoExpirarSessao(funcao: () => void): void {
  aoExpirarSessao = funcao;
}

interface OpcoesApi {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corpo?: unknown;
  autenticada?: boolean;
}

function mensagemPadrao(status: number): string {
  if (status === 401) return 'Sessão expirada ou acesso não autorizado.';
  if (status === 404) return 'Registro não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';
  return 'Não foi possível concluir a operação.';
}

async function converterErro(resposta: Response): Promise<ApiError> {
  try {
    const dados = (await resposta.json()) as { detail?: string; campos?: Record<string, string> };
    return new ApiError(resposta.status, dados.detail ?? mensagemPadrao(resposta.status), dados.campos);
  } catch {
    return new ApiError(resposta.status, mensagemPadrao(resposta.status));
  }
}

export async function api<T>(caminho: string, opcoes: OpcoesApi = {}): Promise<T> {
  const { metodo = 'GET', corpo, autenticada = true } = opcoes;

  const cabecalhos: Record<string, string> = {};
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  const token = tokenStorage.ler();
  if (autenticada && token) cabecalhos['Authorization'] = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se a API está rodando.');
  }

  if (resposta.status === 401 && autenticada) {
    tokenStorage.limpar();
    aoExpirarSessao?.();
  }
  if (!resposta.ok) throw await converterErro(resposta);
  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}