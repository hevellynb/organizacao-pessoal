import { Card, Progress, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface CartaoResumoProps {
  titulo: string;
  valor: string;
  detalhe?: string;
  progresso?: number;
  corDoValor?: string;
  children?: ReactNode;
}

export function CartaoResumo({
  titulo,
  valor,
  detalhe,
  progresso,
  corDoValor,
  children,
}: CartaoResumoProps) {
  return (
    <Card withBorder padding="lg">
      <Text size="sm" c="dimmed" fw={500}>
        {titulo}
      </Text>
      <Text fz={26} fw={700} mt={4} c={corDoValor}>
        {valor}
      </Text>
      {progresso !== undefined && <Progress value={progresso} mt="sm" size="sm" radius="xl" />}
      {detalhe && (
        <Text size="xs" c="dimmed" mt="xs">
          {detalhe}
        </Text>
      )}
      {children}
    </Card>
  );
}