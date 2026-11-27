import { Anchor, Card, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import type { PainelFinanceiro } from '../../api/financas';
import { moeda } from '../../utils/formatar';

interface BlocoProps {
  titulo: string;
  valor: number;
  aportado: number;
  planejado: number;
}

function Bloco({ titulo, valor, aportado, planejado }: BlocoProps) {
  const percentual = planejado > 0 ? Math.min(100, (aportado / planejado) * 100) : 0;

  return (
    <div>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {titulo}
        </Text>
        <Text fw={700} c={valor < 0 ? 'red' : undefined}>
          {moeda(valor)}
        </Text>
      </Group>
      <Progress value={percentual} size="sm" radius="xl" mt={6} />
      <Text size="xs" c="dimmed" mt={4}>
        Aportado no mês: {moeda(aportado)} de {moeda(planejado)}
      </Text>
    </div>
  );
}

export function ReservaEFundo({ financas }: { financas: PainelFinanceiro }) {
  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Reserva e fundo</Title>
        <Anchor component={Link} to="/financas" size="sm">
          Registrar aportes
        </Anchor>
      </Group>
      <Stack gap="lg">
        <Bloco
          titulo="Reserva acumulada"
          valor={financas.reserva.acumulado}
          aportado={financas.reserva.aportadoNoMes}
          planejado={financas.reserva.planejado}
        />
        <Bloco
          titulo="Fundo de recompensas"
          valor={financas.fundo.saldo}
          aportado={financas.fundo.aportadoNoMes}
          planejado={financas.fundo.planejado}
        />
      </Stack>
    </Card>
  );
}