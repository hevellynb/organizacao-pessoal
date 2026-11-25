import { Alert, Button, Center, Loader, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function Carregando() {
  return (
    <Center h={200}>
      <Loader />
    </Center>
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