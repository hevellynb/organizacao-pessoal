import { MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { construirTema } from './construirTema';
import { COR_PADRAO } from './cores';
import { usePreferenciasDispositivo } from './dispositivo';

export function TemaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { preferencias } = usePreferenciasDispositivo();

  // espelho da cor da conta no navegador: evita "piscar" a cor padrão antes do login carregar
  const [corGuardada, setCorGuardada] = useLocalStorage<string>({
    key: 'organizacao.cor',
    defaultValue: COR_PADRAO,
    getInitialValueInEffect: false,
  });

  const corDoUsuario = usuario?.corDestaque;
  const cor = corDoUsuario ?? corGuardada;

  useEffect(() => {
    if (corDoUsuario && corDoUsuario !== corGuardada) setCorGuardada(corDoUsuario);
  }, [corDoUsuario, corGuardada, setCorGuardada]);

  // "desativar animações" liga um atributo no <html>; uma regra do CSS global faz o resto
  useEffect(() => {
    document.documentElement.toggleAttribute('data-sem-animacoes', !preferencias.animacoes);
  }, [preferencias.animacoes]);

  const tema = useMemo(() => construirTema(cor, preferencias), [cor, preferencias]);

  return (
    <MantineProvider theme={tema} defaultColorScheme="auto">
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}