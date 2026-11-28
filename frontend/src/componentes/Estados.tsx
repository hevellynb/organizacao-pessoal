import { Alert, Button, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

/** Esqueleto: o "contorno cinza" de uma lista enquanto os dados chegam. */
export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <Stack gap="sm" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, indice) => (
        <Skeleton key={indice} height={68} radius="md" />
      ))}
    </Stack>
  );
}

export function CarregandoCartoes({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <SimpleGrid cols={{ base: 2, md: quantidade }} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: quantidade }, (_, indice) => (
        <Skeleton key={indice} height={110} radius="md" />
      ))}
    </SimpleGrid>
  );
}

export function ErroDeCarga({ erro, aoTentar }: { erro: Error; aoTentar: () => void }) {
  return (
    <Alert color="red" icon={<IconAlertCircle />} title="Não foi possível carregar os dados">
      <Text size="sm" mb="sm">
        {erro.message}
      </Text>
      <Button variant="light" color="red" onClick={aoTentar}>
        Tentar de novo
      </Button>
    </Alert>
  );
}