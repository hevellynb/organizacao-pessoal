import { useQuery } from '@tanstack/react-query';
import { listarCategorias } from '../api/financas';

/** As categorias são usadas em várias telas: um hook evita repetir a consulta. */
export function useCategorias() {
  return useQuery({ queryKey: ['financas', 'categorias'], queryFn: listarCategorias });
}