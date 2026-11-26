import { useQueryClient } from '@tanstack/react-query';

/** Um resgate mexe em pontos, fundo, despesas e painéis: invalidamos tudo isso de uma vez. */
export function useAposAlterarRecompensas() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
      queryClient.invalidateQueries({ queryKey: ['pontos'] }), // entra o lançamento de resgate no extrato
      queryClient.invalidateQueries({ queryKey: ['financas'] }), // o fundo gasta e surge uma despesa
      queryClient.invalidateQueries({ queryKey: ['painel'] }),
      queryClient.invalidateQueries({ queryKey: ['bingo'] }), // o saldo de pontos aparece na cartela
    ]);
}