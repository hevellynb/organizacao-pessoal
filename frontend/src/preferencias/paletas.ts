import type { MantineColorsTuple } from '@mantine/core';

export type EstiloEscuro = 'azul' | 'preto' | 'grafite';

/**
 * Paleta "dark" do Mantine: 10 tons, do mais claro (0) ao mais escuro (9).
 *  0 e 2 = texto e texto secundário | 4 = bordas | 6 = campos e botões | 7 = fundo da página
 * "grafite" é null: mantém o cinza original do Mantine.
 */
export const PALETAS_ESCURAS: Record<EstiloEscuro, MantineColorsTuple | null> = {
  azul: [
    '#C9D1E3', '#AEB9D1', '#8794B3', '#6B7A9C', '#2C3652',
    '#242C45', '#1B2238', '#111729', '#0C1020', '#070A14',
  ],
  preto: [
    '#D4D4D8', '#B4B4BB', '#8C8C95', '#6F6F78', '#2E2E33',
    '#27272B', '#18181B', '#0B0B0D', '#060607', '#000000',
  ],
  grafite: null,
};