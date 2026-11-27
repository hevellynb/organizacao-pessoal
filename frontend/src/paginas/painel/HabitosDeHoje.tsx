import { Anchor, Button, Card, Checkbox, Divider, Group, Progress, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconFlame } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { buscarListaDoDia, buscarSequencia, marcarHabito, type HabitoDia } from '../../api/habitos';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarHabitos } from '../../hooks/useAposAlterarHabitos';
import { avisarErro } from '../../utils/avisos';
import { hojeISO } from '../../utils/formatar';

function ItemHabito({ habito, dia }: { habito: HabitoDia; dia: string }) {
  const aposAlterar = useAposAlterarHabitos();

  const marcar = useMutation({
    mutationFn: (feito: boolean) => marcarHabito(habito.id, dia, feito),
    onSuccess: aposAlterar,
    onError: (erro) => avisarErro(erro, 'Não foi possível registrar o hábito'),
  });

  const feito = marcar.isPending ? (marcar.variables ?? habito.feito) : habito.feito;

  return (
    <Checkbox
      size="md"
      radius="xl"
      label={habito.nome}
      checked={feito}
      disabled={marcar.isPending}
      onChange={(evento) => marcar.mutate(evento.currentTarget.checked)}
    />
  );
}

function Sequencia() {
  const sequencia = useQuery({ queryKey: ['habitos', 'sequencia'], queryFn: buscarSequencia });
  if (!sequencia.data) return null; // se falhar, o painel segue sem a sequência

  const { atual, melhor, hojeFeito } = sequencia.data;

  return (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon size={42} radius="xl" variant="light" color={atual > 0 ? 'orange' : 'gray'}>
        <IconFlame size={24} />
      </ThemeIcon>
      <div>
        <Text fw={700}>
          {atual === 0 ? 'Sem sequência no momento' : `${atual} ${atual === 1 ? 'dia seguido' : 'dias seguidos'}`}
        </Text>
        <Text size="xs" c="dimmed">
          {atual > 0 && !hojeFeito
            ? 'Marque um hábito hoje para manter a sequência.'
            : `Sua melhor sequência: ${melhor} ${melhor === 1 ? 'dia' : 'dias'}.`}
        </Text>
      </div>
    </Group>
  );
}

export function HabitosDeHoje() {
  const dia = hojeISO();
  const lista = useQuery({
    queryKey: ['habitos', 'dia', dia],
    queryFn: () => buscarListaDoDia(dia),
  });

  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Hábitos de hoje</Title>
        <Anchor component={Link} to="/habitos" size="sm">
          Ver hábitos
        </Anchor>
      </Group>

      <Sequencia />
      <Divider my="md" />

      {lista.isPending ? (
        <Carregando />
      ) : lista.isError ? (
        <ErroDeCarga erro={lista.error} aoTentar={() => lista.refetch()} />
      ) : lista.data.length === 0 ? (
        <Stack align="flex-start" gap="xs">
          <Text c="dimmed" size="sm">
            Você ainda não tem hábitos cadastrados.
          </Text>
          <Button component={Link} to="/habitos" variant="light" size="xs">
            Criar o primeiro hábito
          </Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          <div>
            <Text size="sm" fw={500}>
              {lista.data.filter((h) => h.feito).length} de {lista.data.length} concluídos hoje
            </Text>
            <Progress
              value={(lista.data.filter((h) => h.feito).length / lista.data.length) * 100}
              size="sm"
              radius="xl"
              mt={6}
            />
          </div>
          {lista.data.map((habito) => (
            <ItemHabito key={habito.id} habito={habito} dia={dia} />
          ))}
        </Stack>
      )}
    </Card>
  );
}