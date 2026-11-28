import { Stack, Text, ThemeIcon } from '@mantine/core';
import type { ReactNode } from 'react';

interface EstadoVazioProps {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

export function EstadoVazio({ icone, titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <Stack align="center" gap="xs" py="xl" ta="center">
      <ThemeIcon size={56} radius="xl" variant="light">
        {icone}
      </ThemeIcon>
      <Text fw={600}>{titulo}</Text>
      <Text size="sm" c="dimmed" maw={360}>
        {descricao}
      </Text>
      {acao}
    </Stack>
  );
}