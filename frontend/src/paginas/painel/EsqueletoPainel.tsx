import { SimpleGrid, Skeleton, Stack } from '@mantine/core';

export function EsqueletoPainel() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Carregando o painel">
      <div>
        <Skeleton height={32} width={280} radius="md" />
        <Skeleton height={16} width={200} radius="md" mt={10} />
      </div>
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        {[0, 1, 2, 3].map((indice) => (
          <Skeleton key={indice} height={120} radius="md" />
        ))}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Skeleton height={260} radius="md" />
        <Skeleton height={260} radius="md" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Skeleton height={180} radius="md" />
        <Skeleton height={180} radius="md" />
      </SimpleGrid>
    </Stack>
  );
}