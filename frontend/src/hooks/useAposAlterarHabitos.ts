import { useQueryClient } from '@tanstack/react-query';

/**
 * Devolve uma função que marca como "velhos" todos os dados que dependem dos hábitos.
 * O TanStack Query então busca de novo apenas o que está sendo exibido.
 */
export function useAposAlterarHabitos() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['habitos'] }),
      queryClient.invalidateQueries({ queryKey: ['painel'] }), // o painel mostra o progresso dos hábitos
      queryClient.invalidateQueries({ queryKey: ['bingo'] }), // células do bingo dependem dos hábitos
      queryClient.invalidateQueries({ queryKey: ['pontos'] }), // e os pontos dependem do bingo
    ]);
}