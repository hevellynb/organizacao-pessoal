import { useQueryClient } from '@tanstack/react-query';

/** Marca como "velhos" todos os dados que dependem de finanças. */
export function useAposAlterarFinancas() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['financas'] }),
      queryClient.invalidateQueries({ queryKey: ['painel'] }), // o painel inicial mostra o saldo
      queryClient.invalidateQueries({ queryKey: ['bingo'] }), // metas financeiras do bingo
      queryClient.invalidateQueries({ queryKey: ['pontos'] }),
      queryClient.invalidateQueries({ queryKey: ['wishlist'] }), // o saldo do fundo libera ou bloqueia recompensas
    ]);
}