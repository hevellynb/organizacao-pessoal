import { Card, Progress, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface CartaoResumoProps {
  titulo: string;
  valor: string;
  detalhe?: string;
  progresso?: number;
  corDoValor?: string;
  /** Reserva o espaço da barra mesmo sem progresso, para alinhar cartões lado a lado. */
  reservarBarra?: boolean;
  children?: ReactNode;
}

export function CartaoResumo({
  titulo,
  valor,
  detalhe,
  progresso,
  corDoValor,
  reservarBarra = false,
  children,
}: CartaoResumoProps) {
  return (
    <Card withBorder padding="lg" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Text size="sm" c="dimmed" fw={500}>
        {titulo}
      </Text>
      <Text fz={26} fw={700} mt={4} c={corDoValor}>
        {valor}
      </Text>
      {progresso !== undefined ? (
        <Progress value={progresso} mt="sm" size="sm" radius="xl" />
      ) : reservarBarra ? (
        // uma barra invisível, do mesmo tamanho da real, só para ocupar o lugar
        <Progress value={0} mt="sm" size="sm" radius="xl" style={{ visibility: 'hidden' }} aria-hidden />
      ) : null}
      {detalhe && (
        <Text size="xs" c="dimmed" mt="xs">
          {detalhe}
        </Text>
      )}
      {children}
    </Card>
  );
}