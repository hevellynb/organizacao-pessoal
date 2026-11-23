import { Badge, Card, Group, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';

interface CartaoResumoProps {
  titulo: string;
  valor: string;
  detalhe: string;
  progresso?: number;
}

function CartaoResumo({ titulo, valor, detalhe, progresso }: CartaoResumoProps) {
  return (
    <Card withBorder padding="lg">
      <Text size="sm" c="dimmed" fw={500}>
        {titulo}
      </Text>
      <Text fz={28} fw={700} mt={4}>
        {valor}
      </Text>
      {progresso !== undefined && <Progress value={progresso} mt="sm" size="sm" radius="xl" />}
      <Text size="xs" c="dimmed" mt="xs">
        {detalhe}
      </Text>
    </Card>
  );
}

export function PainelPage() {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Painel</Title>
          <Text c="dimmed">Novembro de 2026</Text>
        </div>
        <Badge variant="light" size="lg">
          dados de exemplo
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <CartaoResumo titulo="Hábitos" valor="65%" progresso={65} detalhe="13 de 20 dias no mês" />
        <CartaoResumo titulo="Bingo" valor="8/25" progresso={32} detalhe="1 linha completa" />
        <CartaoResumo titulo="Pontos" valor="3" detalhe="2 recompensas liberadas" />
        <CartaoResumo titulo="Saldo disponível" valor="R$ 997,50" detalhe="depois dos aportes do mês" />
      </SimpleGrid>
    </Stack>
  );
}