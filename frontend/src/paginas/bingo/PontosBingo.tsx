import { Badge, Button, Card, Group, Modal, NumberInput, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAdjustments } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../api/cliente';
import {
  atualizarRegras,
  buscarPontos,
  buscarRegras,
  type Regras,
  type TipoLancamento,
} from '../../api/bingo';
import { CartaoResumo } from '../../componentes/CartaoResumo';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { avisarErro, avisarSucesso } from '../../utils/avisos';

const ROTULO_LANCAMENTO: Record<TipoLancamento, string> = {
  GANHO_BINGO: 'Bingo',
  RESGATE: 'Recompensa',
  AJUSTE: 'Ajuste',
};

function dataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function validarPontos(valor: number | string): string | null {
  const numero = Number(valor);
  return valor !== '' && Number.isInteger(numero) && numero >= 0 && numero <= 100
    ? null
    : 'Use um número inteiro de 0 a 100.';
}

function CorpoRegras({ regras, aoFechar }: { regras: Regras; aoFechar: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<{ pontosPorLinha: number | string; bonusCartela: number | string }>({
    initialValues: { pontosPorLinha: regras.pontosPorLinha, bonusCartela: regras.bonusCartela },
    validate: { pontosPorLinha: validarPontos, bonusCartela: validarPontos },
  });

  const salvar = useMutation({
    mutationFn: (novas: Regras) => atualizarRegras(novas),
    onSuccess: async () => {
      // mudar a regra recalcula os pontos das cartelas abertas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pontos'] }),
        queryClient.invalidateQueries({ queryKey: ['bingo'] }),
        queryClient.invalidateQueries({ queryKey: ['painel'] }),
        queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
      ]);
      avisarSucesso('Regras atualizadas.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar as regras');
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({
          pontosPorLinha: Number(valores.pontosPorLinha),
          bonusCartela: Number(valores.bonusCartela),
        }),
      )}
    >
      <Stack>
        <NumberInput
          label="Pontos por linha completa"
          min={0}
          max={100}
          allowDecimal={false}
          data-autofocus
          {...form.getInputProps('pontosPorLinha')}
        />
        <NumberInput
          label="Bônus pela cartela completa"
          min={0}
          max={100}
          allowDecimal={false}
          {...form.getInputProps('bonusCartela')}
        />
        <Text size="xs" c="dimmed">
          Ao salvar, os pontos das cartelas ainda abertas são recalculados. Meses já encerrados não mudam.
        </Text>
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

export function PontosBingo() {
  const [editandoRegras, setEditandoRegras] = useState(false);

  const pontos = useQuery({ queryKey: ['pontos'], queryFn: buscarPontos });
  const regras = useQuery({ queryKey: ['pontos', 'regras'], queryFn: buscarRegras });

  if (pontos.isPending || regras.isPending) return <Carregando />;
  if (pontos.isError) return <ErroDeCarga erro={pontos.error} aoTentar={() => pontos.refetch()} />;
  if (regras.isError) return <ErroDeCarga erro={regras.error} aoTentar={() => regras.refetch()} />;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <CartaoResumo
          titulo="Saldo de pontos"
          valor={String(pontos.data.saldo)}
          corDoValor={pontos.data.saldo < 0 ? 'red' : undefined}
          detalhe="Soma de todos os ganhos e gastos do extrato"
        />
        <CartaoResumo
          titulo="Regras de pontuação"
          valor={`${regras.data.pontosPorLinha} por linha`}
          detalhe={`Bônus de ${regras.data.bonusCartela} pontos pela cartela completa`}
        >
          <Button
            variant="light"
            size="xs"
            mt="sm"
            leftSection={<IconAdjustments size={14} />}
            onClick={() => setEditandoRegras(true)}
          >
            Alterar regras
          </Button>
        </CartaoResumo>
      </SimpleGrid>

      <Card withBorder padding="lg">
        <Title order={4} mb="md">
          Extrato de pontos
        </Title>
        {pontos.data.extrato.length === 0 ? (
          <Text c="dimmed" size="sm">
            Nenhum movimento ainda. Complete uma linha do bingo para ganhar seu primeiro ponto.
          </Text>
        ) : (
          <Stack gap="sm">
            {pontos.data.extrato.map((lancamento) => (
              <Group key={lancamento.id} justify="space-between" wrap="nowrap">
                <div>
                  <Text size="sm" fw={500}>
                    {lancamento.descricao ?? ROTULO_LANCAMENTO[lancamento.tipo]}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {ROTULO_LANCAMENTO[lancamento.tipo]} · {dataHora(lancamento.criadoEm)}
                  </Text>
                </div>
                <Badge variant="light" color={lancamento.pontos > 0 ? 'teal' : 'red'} size="lg">
                  {lancamento.pontos > 0 ? `+${lancamento.pontos}` : lancamento.pontos}
                </Badge>
              </Group>
            ))}
          </Stack>
        )}
      </Card>

      <Modal opened={editandoRegras} onClose={() => setEditandoRegras(false)} title="Regras de pontuação" centered>
        <CorpoRegras regras={regras.data} aoFechar={() => setEditandoRegras(false)} />
      </Modal>
    </Stack>
  );
}