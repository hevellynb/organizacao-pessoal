export const CORES_DESTAQUE = [
  { nome: 'violet', rotulo: 'Violeta' },
  { nome: 'indigo', rotulo: 'Índigo' },
  { nome: 'blue', rotulo: 'Azul' },
  { nome: 'cyan', rotulo: 'Ciano' },
  { nome: 'grape', rotulo: 'Uva' },
  { nome: 'pink', rotulo: 'Rosa' },
  { nome: 'orange', rotulo: 'Laranja' },
] as const;

export const COR_PADRAO = 'violet';

/** Garante que um valor vindo do navegador ou da API é uma das cores permitidas. */
export function corValida(cor: string): string {
  return CORES_DESTAQUE.some((c) => c.nome === cor) ? cor : COR_PADRAO;
}