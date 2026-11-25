import { Card, Checkbox, Group, Progress, Stack, Text } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { buscarListaDoDia, marcarHabito, type HabitoDia } from '../../api/habitos';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarHabitos } from '../../hooks/useAposAlterarHabitos';
import { avisarErro } from '../../utils/avisos';

interface LinhaHabitoProps {
  habito: HabitoDia;
  dia: string;
  podeMarcar: boolean;
}

function LinhaHabito({ habito, dia, podeMarcar }: LinhaHabitoProps) {
  const aposAlterar = useAposAlterarHabitos();

  const marcar = useMutation({
    mutationFn: (feito: boolean) => marcarHabito(habito.id, dia, feito),
    onSuccess: aposAlterar,
    onError: (erro) => avisarErro(erro, 'Não foi possível registrar o hábito'),
  });

  // enquanto a gravação não termina, já mostramos o valor novo (a tela parece instantânea)
  const feito = marcar.isPending ? (marcar.variables ?? habito.feito) : habito.feito;
  const percentual = Math.min(100, Math.round((habito.diasNoMes / habito.metaDiasMes) * 100));

  return (
    <Card withBorder padding="md">
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          <Checkbox
            size="lg"
            radius="xl"
            checked={feito}
            disabled={!podeMarcar || marcar.isPending}
            onChange={(evento) => marcar.mutate(evento.currentTarget.checked)}
            aria-label={`Marcar ${habito.nome}`}
          />
          <div>
            <Text fw={600} td={feito ? 'line-through' : undefined} c={feito ? 'dimmed' : undefined}>
              {habito.nome}
            </Text>
            {habito.metaDescricao && (
              <Text size="xs" c="dimmed">
                {habito.metaDescricao}
              </Text>
            )}
          </div>
        </Group>

        <Stack gap={4} w={130}>
          <Text size="xs" c="dimmed" ta="right">
            {habito.diasNoMes}/{habito.metaDiasMes} no mês
          </Text>
          <Progress value={percentual} size="sm" radius="xl" />
        </Stack>
      </Group>
    </Card>
  );
}

export function ListaDoDia({ dia, ehFuturo }: { dia: string; ehFuturo: boolean }) {
  const {
    data: habitos,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['habitos', 'dia', dia],
    queryFn: () => buscarListaDoDia(dia),
  });

  if (isPending) return <Carregando />;
  if (isError) return <ErroDeCarga erro={error} aoTentar={() => refetch()} />;
  if (habitos.length === 0) {
    return <Text c="dimmed">Você ainda não tem hábitos. Crie o primeiro no botão "Novo hábito".</Text>;
  }

  const feitos = habitos.filter((h) => h.feito).length;

  return (
    <Stack>
      <div>
        <Text fw={600}>
          {feitos} de {habitos.length} concluídos
        </Text>
        <Progress value={(feitos / habitos.length) * 100} size="md" radius="xl" mt={6} />
      </div>
      {habitos.map((habito) => (
        <LinhaHabito key={habito.id} habito={habito} dia={dia} podeMarcar={!ehFuturo} />
      ))}
    </Stack>
  );
}