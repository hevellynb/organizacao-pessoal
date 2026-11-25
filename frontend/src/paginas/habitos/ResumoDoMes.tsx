import { Badge, Card, Center, Group, Progress, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { buscarResumoDoMes } from '../../api/habitos';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';

export function ResumoDoMes({ mes }: { mes: string }) {
  const {
    data: resumo,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['habitos', 'resumo', mes],
    queryFn: () => buscarResumoDoMes(mes),
  });

  if (isPending) return <Carregando />;
  if (isError) return <ErroDeCarga erro={error} aoTentar={() => refetch()} />;
  if (resumo.length === 0) return <Text c="dimmed">Nenhum hábito cadastrado.</Text>;

  const [ano, numero] = mes.split('-').map(Number);
  const diasNoCalendario = new Date(ano, numero, 0).getDate(); // último dia do mês

  return (
    <Stack>
      {resumo.map((habito) => {
        const diasFeitos = new Set(habito.diasDoMes);
        return (
          <Card key={habito.id} withBorder padding="md">
            <Group justify="space-between">
              <Text fw={600}>{habito.nome}</Text>
              <Badge variant="light" color={habito.percentual >= 100 ? 'teal' : 'violet'}>
                {habito.diasRealizados}/{habito.metaDiasMes} dias
              </Badge>
            </Group>
            <Progress value={habito.percentual} size="sm" radius="xl" mt="xs" />

            <Group gap={6} mt="md">
              {Array.from({ length: diasNoCalendario }, (_, indice) => indice + 1).map((dia) => {
                const feito = diasFeitos.has(dia);
                return (
                  <Center
                    key={dia}
                    w={28}
                    h={28}
                    style={{
                      borderRadius: 'var(--mantine-radius-sm)',
                      background: feito
                        ? 'var(--mantine-primary-color-filled)'
                        : 'var(--mantine-color-default-hover)',
                    }}
                  >
                    <Text fz={11} fw={600} c={feito ? 'white' : 'dimmed'}>
                      {dia}
                    </Text>
                  </Center>
                );
              })}
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}