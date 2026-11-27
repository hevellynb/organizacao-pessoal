import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buscarUsuarioAtual, cadastrarUsuario, login } from '../api/auth';
import { registrarAoExpirarSessao, tokenStorage } from '../api/cliente';
import type { Usuario } from '../api/tipos';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // se existe token guardado, começamos "carregando" até descobrir quem é o usuário
  const [carregando, setCarregando] = useState<boolean>(() => tokenStorage.ler() !== null);

  const sair = useCallback(() => {
    tokenStorage.limpar();
    queryClient.clear(); // apaga os dados em cache, para o próximo usuário não ver os do anterior
    setUsuario(null);
  }, [queryClient]);

  // se qualquer chamada receber 401, encerra a sessão
  useEffect(() => {
    registrarAoExpirarSessao(sair);
  }, [sair]);

  // ao abrir o app: se há token, pergunta ao backend quem é o usuário
  useEffect(() => {
    if (tokenStorage.ler() === null) return;
    let ativo = true;
    buscarUsuarioAtual()
      .then((u) => {
        if (ativo) setUsuario(u);
      })
      .catch(() => undefined) // 401: o cliente já limpou a sessão; falha de rede: mantém o token
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const resposta = await login(email, senha);
      queryClient.clear();
      tokenStorage.gravar(resposta.token);
      setUsuario(resposta.usuario);
    },
    [queryClient],
  );

  const cadastrar = useCallback(
    async (nome: string, email: string, senha: string) => {
      const resposta = await cadastrarUsuario(nome, email, senha);
      queryClient.clear();
      tokenStorage.gravar(resposta.token);
      setUsuario(resposta.usuario);
    },
    [queryClient],
  );

    const atualizarUsuario = useCallback((novo: Usuario) => setUsuario(novo), []);

    const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair, atualizarUsuario }),
    [usuario, carregando, entrar, cadastrar, sair, atualizarUsuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}