import { useLocalStorage } from '@mantine/hooks';
import { useMemo } from 'react';
import type { EstiloEscuro } from './paletas';

export type Cantos = 'xs' | 'md' | 'xl';
export type TamanhoTexto = 'pequeno' | 'normal' | 'grande';

export interface PreferenciasDispositivo {
  estiloEscuro: EstiloEscuro;
  cantos: Cantos;
  tamanhoTexto: TamanhoTexto;
  animacoes: boolean;
}

export const PADRAO: PreferenciasDispositivo = {
  estiloEscuro: 'azul',
  cantos: 'md',
  tamanhoTexto: 'normal',
  animacoes: true,
};

/** Preferências que valem só para este navegador. Ficam no localStorage. */
export function usePreferenciasDispositivo() {
  const [guardadas, definir] = useLocalStorage<Partial<PreferenciasDispositivo>>({
    key: 'organizacao.preferencias',
    defaultValue: {},
    getInitialValueInEffect: false, // lê já na primeira renderização, sem "piscar"
  });

  // o que não foi guardado ainda usa o padrão
  const preferencias = useMemo<PreferenciasDispositivo>(() => ({ ...PADRAO, ...guardadas }), [guardadas]);

  const atualizar = (mudancas: Partial<PreferenciasDispositivo>) => definir({ ...guardadas, ...mudancas });
  const restaurar = () => definir({});

  return { preferencias, atualizar, restaurar };
}