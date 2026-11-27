import { Anchor, Badge, Button, Card, ColorSwatch, Group, RingProgress, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import type { LinhaCategoria } from '../../api/financas';
import { moeda } from '../../utils/formatar';

// cores das fatias (ficam de fora o verde-água e o vermelho, que têm significado no app)
const CORES = ['violet', 'cyan', 'orange', 'pink', 'grape', 'indigo', 'blue'];

interface GastosDoMesProps {
  categorias: LinhaCategoria[];
  totalDespesas: number;
}

export function GastosDoMes({ categorias, totalDespesas }: GastosDoMesProps) {
  const comGasto = categorias.filter((c) => c.gasto > 0);

  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Gastos do mês</Title>
        <Anchor component={Link} to="/financas" size="sm">
          Ver finanças
        </Anchor>
      </Group>

      {comGasto.length === 0 ? (
        <Stack align="flex-start" gap="xs">
          <Text c="dimmed" size="sm">
            Nenhuma despesa lançada neste mês.
          </Text>
          <Button component={Link} to="/financas" variant="light" size="xs">
            Ir para as finanças
          </Button>
        </Stack>
      ) : (
        <Group align="center" justify="center" gap="xl" wrap="wrap">
          <RingProgress
            size={170}
            thickness={22}
            sections={comGasto.map((categoria, indice) => ({
              value: (categoria.gasto / totalDespesas) * 100,
              color: CORES[indice % CORES.length],
              tooltip: `${categoria.nome}: ${moeda(categoria.gasto)}`,
            }))}
            label={
              <Stack gap={0} align="center">
                <Text size="xs" c="dimmed">
                  Total
                </Text>
                <Text fw={700} size="sm">
                  {moeda(totalDespesas)}
                </Text>
              </Stack>
            }
          />

          <Stack gap="xs" style={{ flex: 1, minWidth: 180 }}>
            {comGasto.map((categoria, indice) => (
              <Group key={categoria.id} justify="space-between" wrap="nowrap" gap="xs">
                <Group gap="xs" wrap="nowrap">
                  <ColorSwatch
                    size={12}
                    color={`var(--mantine-color-${CORES[indice % CORES.length]}-6)`}
                  />
                  <Text size="sm">{categoria.nome}</Text>
                  {categoria.estourou && (
                    <Badge color="red" variant="light" size="xs">
                      estourou
                    </Badge>
                  )}
                </Group>
                <Text size="sm" fw={500}>
                  {moeda(categoria.gasto)}
                </Text>
              </Group>
            ))}
          </Stack>
        </Group>
      )}
    </Card>
  );
}