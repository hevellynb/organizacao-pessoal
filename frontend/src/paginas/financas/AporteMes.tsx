import { ActionIcon, Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  buscarPainelFinanceiro,
  excluirAporte,
  listarAportes,
  type Aporte,
  type DestinoAporte,
} from '../../api/financas';
import { CartaoResumo } from '../../componentes/CartaoResumo';
import { ConfirmarExclusao } from '../../componentes/ConfirmarExclusao';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { dataCurta, mesAtual, moeda } from '../../utils/formatar';
import { FormularioAporte } from './FormularioAporte';

const ROTULO_DESTINO: Record<DestinoAporte, string> = {
  RESERVA: 'Reserva',
  FUNDO: 'Fundo de recompensas',
};

export function AportesMes({ mes }: { mes: string }) {
  const [novo, setNovo] = useState<DestinoAporte | null>(null);
  const [aExcluir, setAExcluir] = useState<Aporte | null>(null);
  const aposAlterar = useAposAlterarFinancas();

  const painel = useQuery({
    queryKey: ['financas', 'painel', mes],
    queryFn: () => buscarPainelFinanceiro(mes),
  });
  const aportes = useQuery({
    queryKey: ['financas', 'aportes', mes],
    queryFn: () => listarAportes(mes),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirAporte(id),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Aporte excluído.');
      setAExcluir(null);
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível excluir o aporte'),
  });

  if (painel.isPending || aportes.isPending) return <Carregando />;
  if (painel.isError) return <ErroDeCarga erro={painel.error} aoTentar={() => painel.refetch()} />;
  if (aportes.isError) return <ErroDeCarga erro={aportes.error} aoTentar={() => aportes.refetch()} />;

  const resumo = painel.data;
  const mesFuturo = mes > mesAtual(); // não existe aporte com data futura

  return (
    <Stack>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <CartaoResumo
          titulo="Reserva (acumulada)"
          valor={moeda(resumo.reserva.acumulado)}
          detalhe={`Aportado neste mês: ${moeda(resumo.reserva.aportadoNoMes)} · meta: ${moeda(resumo.reserva.planejado)}`}
        >
          <Button
            variant="light"
            size="xs"
            mt="sm"
            leftSection={<IconPlus size={14} />}
            disabled={mesFuturo}
            onClick={() => setNovo('RESERVA')}
          >
            Aportar na reserva
          </Button>
        </CartaoResumo>

        <CartaoResumo
          titulo="Fundo de recompensas"
          valor={moeda(resumo.fundo.saldo)}
          detalhe={`Aportado neste mês: ${moeda(resumo.fundo.aportadoNoMes)} · meta: ${moeda(resumo.fundo.planejado)}`}
        >
          <Button
            variant="light"
            size="xs"
            mt="sm"
            leftSection={<IconPlus size={14} />}
            disabled={mesFuturo}
            onClick={() => setNovo('FUNDO')}
          >
            Aportar no fundo
          </Button>
        </CartaoResumo>
      </SimpleGrid>

      {mesFuturo && (
        <Text size="sm" c="dimmed">
          Não é possível registrar aportes em meses futuros.
        </Text>
      )}

      {aportes.data.length === 0 ? (
        <Text c="dimmed">Nenhum aporte neste mês.</Text>
      ) : (
        aportes.data.map((aporte) => (
          <Card key={aporte.id} withBorder padding="md">
            <Group justify="space-between" wrap="nowrap">
              <Group wrap="nowrap">
                <Badge variant="light" color={aporte.destino === 'RESERVA' ? 'teal' : 'grape'}>
                  {ROTULO_DESTINO[aporte.destino]}
                </Badge>
                <div>
                  <Text fw={600}>{moeda(aporte.valor)}</Text>
                  <Text size="xs" c="dimmed">
                    {dataCurta(aporte.data)}
                    {aporte.observacao ? ` · ${aporte.observacao}` : ''}
                  </Text>
                </div>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label="Excluir aporte"
                onClick={() => setAExcluir(aporte)}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Card>
        ))
      )}

      <FormularioAporte destino={novo} mes={mes} aoFechar={() => setNovo(null)} />
      <ConfirmarExclusao
        aberto={aExcluir !== null}
        titulo="Excluir aporte"
        mensagem={`Excluir o aporte de ${moeda(aExcluir?.valor ?? 0)} ${
          aExcluir ? `no ${ROTULO_DESTINO[aExcluir.destino].toLowerCase()}` : ''
        }?`}
        carregando={excluir.isPending}
        aoConfirmar={() => aExcluir && excluir.mutate(aExcluir.id)}
        aoFechar={() => setAExcluir(null)}
      />
    </Stack>
  );
}