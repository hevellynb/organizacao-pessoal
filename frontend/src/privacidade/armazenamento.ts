const CHAVE = 'organizacao.privacidade';
const ouvintes = new Set<() => void>();

function lerInicial(): boolean {
  try {
    return localStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}

let ocultos = lerInicial();

export function valoresOcultos(): boolean {
  return ocultos;
}

export function definirValoresOcultos(valor: boolean): void {
  ocultos = valor;
  try {
    localStorage.setItem(CHAVE, valor ? '1' : '0');
  } catch {
    // se o navegador bloquear o armazenamento, o interruptor vale só até recarregar
  }
  ouvintes.forEach((avisar) => avisar());
}

export function assinar(avisar: () => void): () => void {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}