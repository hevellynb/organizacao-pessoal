import { Stack, Text, Title } from '@mantine/core';

export function PaginaEmBreve({ titulo }: { titulo: string }) {
  return (
    <Stack gap="xs">
      <Title order={2}>{titulo}</Title>
      <Text c="dimmed">Esta tela será construída nas próximas etapas.</Text>
    </Stack>
  );
}