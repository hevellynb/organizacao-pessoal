import { createTheme, type MantineThemeOverride } from '@mantine/core';
import { corValida } from './cores';
import type { PreferenciasDispositivo, TamanhoTexto } from './dispositivo';
import { PALETAS_ESCURAS } from './paletas';

const ESCALA_TEXTO: Record<TamanhoTexto, number> = {
  pequeno: 0.92,
  normal: 1,
  grande: 1.12,
};

const FONTE = "'Inter Variable', system-ui, sans-serif";

export function construirTema(cor: string, preferencias: PreferenciasDispositivo): MantineThemeOverride {
  const paletaEscura = PALETAS_ESCURAS[preferencias.estiloEscuro];

  return createTheme({
    primaryColor: corValida(cor),
    defaultRadius: preferencias.cantos,
    scale: ESCALA_TEXTO[preferencias.tamanhoTexto],
    respectReducedMotion: true,
    fontFamily: FONTE,
    headings: { fontFamily: FONTE, fontWeight: '700' },
    ...(paletaEscura ? { colors: { dark: paletaEscura } } : {}),
  });
}