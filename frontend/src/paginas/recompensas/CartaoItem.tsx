import { ActionIcon, Badge, Button, Card, Group, Menu, Progress, Stack, Text } from '@mantine/core';
import { IconDotsVertical, IconGift, IconPencil, IconSparkles, IconTrash } from '@tabler/icons-react';
import type { ItemDesejo, Prioridade } from '../../api/recompensas';
import { moeda } from '../../utils/formatar';
import classes from './Recompensas.module.css';

const PRIORIDADE: Record<Prioridade, { rotulo: string; cor: string }> = {
  ALTA: { rotulo: 'Prioridade alta', cor: 'red' },
  MEDIA: { rotulo: 'Prioridade média', cor: 'yellow' },
  BAIXA: { rotulo: 'Prioridade baixa', cor: 'gray' },
};

function percentual(parte: number, total: number): number {
  return total > 0 ? Math.max(0, Math.min(100, (parte / total) * 100)) : 100;
}

interface CartaoItemProps {
  item: ItemDesejo;
  saldoPontos: number;
  fundoDisponivel: number;
  aoResgatar: () => void;
  aoEditar: () => void;
  aoExcluir: () => void;
}

export function CartaoItem({
  item,
  saldoPontos,
  fundoDisponivel,
  aoResgatar,
  aoEditar,
  aoExcluir,
}: CartaoItemProps) {
  const prioridade = PRIORIDADE[item.prioridade];

  // só para escrever o texto "faltam..." (quem decide se pode resgatar é o backend)
  const faltamPontos = Math.max(0, item.pontosNecessarios - saldoPontos);
  const faltamReais = Math.max(0, Math.round((item.precoEstimado - fundoDisponivel) * 100) / 100);

  return (
    <Card
      withBorder
      padding="lg"
      className={[classes.item, item.disponivelParaResgate ? classes.liberado : ''].join(' ')}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text fw={700} size="lg">
            {item.nome}
          </Text>
          {item.descricao && (
            <Text size="sm" c="dimmed">
              {item.descricao}
            </Text>
          )}
        </div>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label={`Opções de ${item.nome}`}>
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={aoEditar}>
              Editar
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={aoExcluir}>
              Excluir
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group gap="xs" mt="sm">
        {item.disponivelParaResgate && (
          <Badge color="teal" leftSection={<IconSparkles size={12} />}>
            Liberado
          </Badge>
        )}
        <Badge variant="light" color={prioridade.cor}>
          {prioridade.rotulo}
        </Badge>
        <Badge variant="outline" color="violet">
          {item.pontosNecessarios} pts
        </Badge>
        <Badge variant="outline" color="gray">
          {moeda(item.precoEstimado)}
        </Badge>
      </Group>

      <Stack gap="sm" mt="md">
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">
              Pontos
            </Text>
            <Text size="xs" c={item.pontosSuficientes ? 'teal' : 'dimmed'}>
              {item.pontosSuficientes ? 'Pontos suficientes' : `Faltam ${faltamPontos} ponto(s)`}
            </Text>
          </Group>
          <Progress
            value={percentual(saldoPontos, item.pontosNecessarios)}
            size="sm"
            radius="xl"
            color={item.pontosSuficientes ? 'teal' : undefined}
          />
        </div>

        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">
              Fundo de recompensas
            </Text>
            <Text size="xs" c={item.fundoSuficiente ? 'teal' : 'dimmed'}>
              {item.fundoSuficiente ? 'Saldo suficiente' : `Faltam ${moeda(faltamReais)}`}
            </Text>
          </Group>
          <Progress
            value={percentual(fundoDisponivel, item.precoEstimado)}
            size="sm"
            radius="xl"
            color={item.fundoSuficiente ? 'teal' : undefined}
          />
        </div>
      </Stack>

      <Button
        fullWidth
        mt="md"
        leftSection={<IconGift size={18} />}
        disabled={!item.disponivelParaResgate}
        onClick={aoResgatar}
      >
        Resgatar
      </Button>
    </Card>
  );
}