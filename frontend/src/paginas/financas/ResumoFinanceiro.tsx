import { Button, Card, Group, Modal, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPencil } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../api/cliente';
import { buscarPainelFinanceiro, buscarRenda, definirRenda } from '../../api/financas';
import { CampoDinheiro } from '../../componentes/CampoDinheiro';
import { CartaoResumo } from '../../componentes/CartaoResumo';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { moeda, nomeDoMes } from '../../utils/formatar';

function percentual(parte: number, total: number): number {
  return total > 0 ? Math.min(100, (parte / total) * 100) : 0;
}

function CorpoRenda({
  mes,
  valorAtual,
  aoFechar,
}: {
  mes: string;
  valorAtual: number;
  aoFechar: () => void;
}) {
  const aposAlterar = useAposAlterarFinancas();

  const form = useForm<{ valor: number | string }>({
    initialValues: { valor: valorAtual },
    validate: {
      valor: (v) => (v !== '' && Number(v) >= 0 ? null : 'Informe a renda do mês.'),
    },
  });

  const salvar = useMutation({
    mutationFn: (valor: number) => definirRenda(mes, valor),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Renda atualizada.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar a renda');
    },
  });

  return (
    <form onSubmit={form.onSubmit((valores) => salvar.mutate(Number(valores.valor)))}>
      <Stack>
        <CampoDinheiro label={`Renda de ${nomeDoMes(mes)}`} data-autofocus {...form.getInputProps('valor')} />
        <Group justify="flex-end">
          <Button variant="default" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvar.isPending}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ResumoFinanceiro({ mes }: { mes: string }) {
  const [editandoRenda, setEditandoRenda] = useState(false);

  const painel = useQuery({
    queryKey: ['financas', 'painel', mes],
    queryFn: () => buscarPainelFinanceiro(mes),
  });
  const renda = useQuery({
    queryKey: ['financas', 'renda', mes],
    queryFn: () => buscarRenda(mes),
  });

  if (painel.isPending || renda.isPending) return <Carregando />;
  if (painel.isError) return <ErroDeCarga erro={painel.error} aoTentar={() => painel.refetch()} />;
  if (renda.isError) return <ErroDeCarga erro={renda.error} aoTentar={() => renda.refetch()} />;

  const resumo = painel.data;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <CartaoResumo
          titulo="Renda do mês"
          valor={moeda(resumo.renda)}
          detalhe={
            renda.data.herdada
              ? 'Valor herdado de um mês anterior. Edite para definir a renda deste mês.'
              : 'Renda definida para este mês.'
          }
        >
          <Button
            variant="light"
            size="xs"
            mt="sm"
            leftSection={<IconPencil size={14} />}
            onClick={() => setEditandoRenda(true)}
          >
            Editar renda
          </Button>
        </CartaoResumo>

        <CartaoResumo
          titulo="Saldo disponível"
          valor={moeda(resumo.saldoDisponivel)}
          corDoValor={resumo.saldoDisponivel < 0 ? 'red' : undefined}
          detalhe={`Sem destino ainda. Livre após as metas de aporte: ${moeda(resumo.saldoAposMetas)}`}
        />

        <CartaoResumo
          titulo="Despesas do mês"
          valor={moeda(resumo.totalDespesas)}
          detalhe={`Orçamento total planejado: ${moeda(resumo.totalOrcado)}`}
        />

        <CartaoResumo
          titulo="Reserva (acumulada)"
          valor={moeda(resumo.reserva.acumulado)}
          progresso={percentual(resumo.reserva.aportadoNoMes, resumo.reserva.planejado)}
          detalhe={`Aportado no mês: ${moeda(resumo.reserva.aportadoNoMes)} de ${moeda(resumo.reserva.planejado)}`}
        />

        <CartaoResumo
          titulo="Fundo de recompensas"
          valor={moeda(resumo.fundo.saldo)}
          corDoValor={resumo.fundo.saldo < 0 ? 'red' : undefined}
          progresso={percentual(resumo.fundo.aportadoNoMes, resumo.fundo.planejado)}
          detalhe={`Aportado no mês: ${moeda(resumo.fundo.aportadoNoMes)} de ${moeda(resumo.fundo.planejado)} · gasto: ${moeda(resumo.fundo.gastoNoMes)}`}
        />
      </SimpleGrid>

      <Card withBorder padding="lg">
        <Title order={4} mb="md">
          Orçado × realizado
        </Title>
        <Stack gap="md">
          {resumo.categorias.map((linha) => (
            <div key={linha.id}>
              <Group justify="space-between" mb={4}>
                <Text fw={500}>{linha.nome}</Text>
                <Text size="sm" c={linha.estourou ? 'red' : 'dimmed'}>
                  {moeda(linha.gasto)} de {moeda(linha.orcamento)}
                </Text>
              </Group>
              <Progress
                value={Math.min(100, linha.percentual)}
                color={linha.estourou ? 'red' : linha.percentual >= 80 ? 'yellow' : 'violet'}
                size="sm"
                radius="xl"
              />
              <Text size="xs" c={linha.estourou ? 'red' : 'dimmed'} mt={4}>
                {linha.estourou
                  ? `Estourou em ${moeda(-linha.restante)}`
                  : `Restam ${moeda(linha.restante)}`}
              </Text>
            </div>
          ))}
        </Stack>
      </Card>

      <Modal
        opened={editandoRenda}
        onClose={() => setEditandoRenda(false)}
        title="Editar renda do mês"
        centered
      >
        <CorpoRenda
          key={mes}
          mes={mes}
          valorAtual={resumo.renda}
          aoFechar={() => setEditandoRenda(false)}
        />
      </Modal>
    </Stack>
  );
}