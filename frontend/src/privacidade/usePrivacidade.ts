import { useSyncExternalStore } from 'react';
import { assinar, definirValoresOcultos, valoresOcultos } from './armazenamento';

/** Devolve [valores estão ocultos?, função para alternar]. */
export function usePrivacidade(): [boolean, () => void] {
  const ocultos = useSyncExternalStore(assinar, valoresOcultos);
  return [ocultos, () => definirValoresOcultos(!ocultos)];
}