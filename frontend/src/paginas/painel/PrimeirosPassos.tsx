import { Button, Card, Group, Progress, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import type { PainelGeral } from '../../api/painel';
import { buscarDesejos } from '../../api/recompensas';

interface Passo {
  chave: string;
  titulo: string;
  descricao: string;
  feito: boolean;
  rota: string;
}

export function PrimeirosPassos({ dados }: { dados: PainelGeral }) {
  const [dispensado, setDispensado] = useLocalStorage<boolean>({
    key: 'organizacao.guia-dispensado',
    defaultValue: false,
    getInitialValueInEffect: false,
  });
  const desejos = useQuery({ queryKey: ['wishlist'], queryFn: buscarDesejos });

  const passos: Passo[] = [
    {
      chave: 'renda',
      titulo: 'Informar a renda do mês',
      descricao: 'Em Finanças, para o app calcular o seu saldo.',
      feito: dados.financas.renda > 0,
      rota: '/financas',
    },
    {
      chave: 'habito',
      titulo: 'Criar um hábito',
      descricao: 'Algo que você quer fazer com constância.',
      feito: dados.habitos.habitos > 0,
      rota: '/habitos',
    },
    {
      chave: 'bingo',
      titulo: 'Montar os desafios do bingo',
      descricao: 'Eles continuam nos meses seguintes.',
      feito: dados.bingo.celulasDefinidas > 0,
      rota: '/bingo',
    },
    {
      chave: 'aporte',
      titulo: 'Fazer o primeiro aporte',
      descricao: 'Guarde algo na reserva ou no fundo de recompensas.',
      feito: dados.financas.reserva.acumulado > 0 || dados.financas.fundo.saldo > 0,
      rota: '/financas',
    },
    {
      chave: 'desejo',
      titulo: 'Cadastrar um desejo',
      descricao: 'O que você quer conquistar com os seus pontos.',
      feito: (desejos.data?.itens.length ?? 0) > 0,
      rota: '/recompensas',
    },
  ];

  const concluidos = passos.filter((passo) => passo.feito).length;

  // some sozinho quando tudo está feito, ou quando você dispensa
  if (dispensado || concluidos === passos.length) return null;

  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="xs">
        <Title order={4}>Primeiros passos</Title>
        <Button variant="subtle" color="gray" size="xs" onClick={() => setDispensado(true)}>
          Dispensar
        </Button>
      </Group>
      <Text size="sm" c="dimmed">
        {concluidos} de {passos.length} concluídos
      </Text>
      <Progress value={(concluidos / passos.length) * 100} size="sm" radius="xl" mt={6} mb="md" />

      <Stack gap="sm">
        {passos.map((passo) => (
          <Group key={passo.chave} justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon
                size={26}
                radius="xl"
                color={passo.feito ? 'teal' : 'gray'}
                variant={passo.feito ? 'filled' : 'light'}
              >
                <IconCheck size={16} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={500} td={passo.feito ? 'line-through' : undefined} c={passo.feito ? 'dimmed' : undefined}>
                  {passo.titulo}
                </Text>
                <Text size="xs" c="dimmed">
                  {passo.descricao}
                </Text>
              </div>
            </Group>
            {!passo.feito && (
              <Button component={Link} to={passo.rota} size="xs" variant="light">
                Ir
              </Button>
            )}
          </Group>
        ))}
      </Stack>
    </Card>
  );
}