import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { buscarPainel } from '../api/painel';
import { mesAtual, moeda, nomeDoMes } from '../utils/formatar';

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
  const mes = mesAtual();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['painel', mes],
    queryFn: () => buscarPainel(mes),
  });

  if (isPending) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Alert color="red" icon={<IconAlertCircle />} title="Não foi possível carregar o painel">
        <Text size="sm" mb="sm">
          {error.message}
        </Text>
        <Button variant="light" color="red" onClick={() => refetch()}>
          Tentar de novo
        </Button>
      </Alert>
    );
  }

  const bingoPercentual = Math.round((data.bingo.celulasConcluidas / 25) * 100);

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Painel</Title>
        <Text c="dimmed">{nomeDoMes(data.mes)}</Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <CartaoResumo
          titulo="Hábitos"
          valor={`${data.habitos.percentual}%`}
          progresso={data.habitos.percentual}
          detalhe={`${data.habitos.diasRealizados} de ${data.habitos.metaTotalDias} dias da meta`}
        />
        <CartaoResumo
          titulo="Bingo"
          valor={`${data.bingo.celulasConcluidas}/25`}
          progresso={bingoPercentual}
          detalhe={`Linhas completas: ${data.bingo.linhas} · ${data.bingo.pontosDoMes} pts no mês`}
        />
        <CartaoResumo
          titulo="Pontos"
          valor={String(data.saldoPontos)}
          detalhe={`${data.recompensasDisponiveis.length} recompensa(s) liberada(s)`}
        />
        <CartaoResumo
          titulo="Saldo disponível"
          valor={moeda(data.financas.saldoDisponivel)}
          detalhe={`Livre após as metas: ${moeda(data.financas.saldoAposMetas)}`}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="lg">
          <Title order={4} mb="sm">
            Finanças do mês
          </Title>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text c="dimmed">Renda</Text>
              <Text fw={500}>{moeda(data.financas.renda)}</Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed">Despesas</Text>
              <Text fw={500}>{moeda(data.financas.totalDespesas)}</Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder padding="lg">
          <Title order={4} mb="sm">
            Recompensas liberadas
          </Title>
          {data.recompensasDisponiveis.length === 0 ? (
            <Text c="dimmed" size="sm">
              Nenhuma por enquanto. Complete linhas do bingo para ganhar pontos.
            </Text>
          ) : (
            <Stack gap="xs">
              {data.recompensasDisponiveis.map((item) => (
                <Group key={item.id} justify="space-between">
                  <Text>{item.nome}</Text>
                  <Group gap="xs">
                    <Badge variant="light">{item.pontosNecessarios} pts</Badge>
                    <Text size="sm" c="dimmed">
                      {moeda(item.precoEstimado)}
                    </Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
}