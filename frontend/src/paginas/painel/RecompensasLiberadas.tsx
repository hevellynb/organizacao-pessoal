import { Anchor, Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconGift } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import type { ItemDesejo } from '../../api/recompensas';
import { moeda } from '../../utils/formatar';
import { ResgatarModal } from '../recompensas/ResgatarModal';

export function RecompensasLiberadas({ itens, saldoPontos }: { itens: ItemDesejo[]; saldoPontos: number }) {
  const [aResgatar, setAResgatar] = useState<ItemDesejo | null>(null);

  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Recompensas liberadas</Title>
        <Anchor component={Link} to="/recompensas" size="sm">
          Ver lista de desejos
        </Anchor>
      </Group>

      {itens.length === 0 ? (
        <Stack gap={4}>
          <Text c="dimmed" size="sm">
            Nenhum item liberado por enquanto.
          </Text>
          <Text c="dimmed" size="xs">
            Você tem {saldoPontos} ponto(s). Um item é liberado quando os pontos e o saldo do fundo são suficientes.
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {itens.map((item) => (
            <Group key={item.id} justify="space-between" wrap="nowrap">
              <div>
                <Text fw={600}>{item.nome}</Text>
                <Group gap="xs">
                  <Badge variant="light" size="sm">
                    {item.pontosNecessarios} pts
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {moeda(item.precoEstimado)}
                  </Text>
                </Group>
              </div>
              <Button size="xs" leftSection={<IconGift size={14} />} onClick={() => setAResgatar(item)}>
                Resgatar
              </Button>
            </Group>
          ))}
        </Stack>
      )}

      <ResgatarModal item={aResgatar} aoFechar={() => setAResgatar(null)} />
    </Card>
  );
}