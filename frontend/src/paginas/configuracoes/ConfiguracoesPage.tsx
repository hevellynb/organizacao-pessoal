import { Button, Card, Stack, Text, Title } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../../auth/useAuth';
import { SecaoAparencia } from './SecaoAparencia';
import { SecaoPerfil } from './SecaoPerfil';

export function ConfiguracoesPage() {
  const { usuario, sair } = useAuth();

  return (
    <Stack gap="lg" maw={720}>
      <div>
        <Title order={2}>Configurações</Title>
        <Text c="dimmed">Deixe o app com a sua cara.</Text>
      </div>

      <SecaoPerfil />
      <SecaoAparencia />

      <Card withBorder padding="lg">
        <Title order={4} mb="xs">
          Conta
        </Title>
        <Text size="sm">{usuario?.nome}</Text>
        <Text size="sm" c="dimmed" mb="md">
          {usuario?.email}
        </Text>
        <Button variant="light" color="red" leftSection={<IconLogout size={16} />} onClick={sair}>
          Sair da conta
        </Button>
      </Card>
    </Stack>
  );
}