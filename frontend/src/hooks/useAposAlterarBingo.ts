import { useQueryClient } from '@tanstack/react-query';
import type { Cartela } from '../api/bingo';

/**
 * As rotas do bingo devolvem a cartela inteira já atualizada.
 * Em vez de buscá-la de novo, gravamos a resposta direto no cache (setQueryData),
 * e só marcamos como "velhos" os dados de outras telas que dependem dos pontos.
 */
export function useAposAlterarBingo(mes: string) {
  const queryClient = useQueryClient();

  return (cartela: Cartela) => {
    queryClient.setQueryData(['bingo', mes], cartela);
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['painel'] }),
      queryClient.invalidateQueries({ queryKey: ['pontos'] }),
      queryClient.invalidateQueries({ queryKey: ['wishlist'] }), // pontos liberam ou bloqueiam recompensas
    ]);
  };
}