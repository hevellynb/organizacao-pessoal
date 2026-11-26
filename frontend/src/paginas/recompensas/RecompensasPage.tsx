import { Button, Card, Group, SimpleGrid, Stack, Tabs, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { buscarDesejos, excluirItem, type ItemDesejo } from '../../api/recompensas';
import { CartaoResumo } from '../../componentes/CartaoResumo';
import { ConfirmarExclusao } from '../../componentes/ConfirmarExclusao';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarRecompensas } from '../../hooks/useAposAlterarRecompensas';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { dataDoTimestamp, moeda } from '../../utils/formatar';
import { CartaoItem } from './CartaoItem';
import { FormularioItem } from './FormularioItem';
import { ResgatarModal } from './ResgatarModal';

export function RecompensasPage() {
  const [edicao, setEdicao] = useState<ItemDesejo | 'novo' | null>(null);
  const [aResgatar, setAResgatar] = useState<ItemDesejo | null>(null);
  const [aExcluir, setAExcluir] = useState<ItemDesejo | null>(null);
  const aposAlterar = useAposAlterarRecompensas();

  const lista = useQuery({ queryKey: ['wishlist'], queryFn: buscarDesejos });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirItem(id),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Item excluído.');
      setAExcluir(null);
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível excluir o item'),
  });

  if (lista.isPending) return <Carregando />;
  if (lista.isError) return <ErroDeCarga erro={lista.error} aoTentar={() => lista.refetch()} />;

  const { itens, saldoPontos, fundoDisponivel } = lista.data;
  const pendentes = itens.filter((i) => i.status === 'PENDENTE');
  const adquiridos = itens.filter((i) => i.status === 'ADQUIRIDO');
  const liberados = pendentes.filter((i) => i.disponivelParaResgate).length;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Recompensas</Title>
          <Text c="dimmed">Troque seus pontos e o dinheiro do fundo pelo que você quer.</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={() => setEdicao('novo')}>
          Novo item
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <CartaoResumo
          titulo="Saldo de pontos"
          valor={String(saldoPontos)}
          corDoValor={saldoPontos < 0 ? 'red' : undefined}
          detalhe="Ganhos do bingo menos os resgates"
        />
        <CartaoResumo
          titulo="Fundo de recompensas"
          valor={moeda(fundoDisponivel)}
          corDoValor={fundoDisponivel < 0 ? 'red' : undefined}
          detalhe="Aportes acumulados menos o que já foi gasto"
        />
        <CartaoResumo
          titulo="Liberados para resgate"
          valor={String(liberados)}
          detalhe={`de ${pendentes.length} item(ns) na lista de desejos`}
        />
      </SimpleGrid>

      <Tabs defaultValue="desejos" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="desejos">Desejos ({pendentes.length})</Tabs.Tab>
          <Tabs.Tab value="adquiridos">Adquiridos ({adquiridos.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="desejos" pt="md">
          {pendentes.length === 0 ? (
            <Text c="dimmed">
              Sua lista de desejos está vazia. Adicione o primeiro item no botão "Novo item".
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {pendentes.map((item) => (
                <CartaoItem
                  key={item.id}
                  item={item}
                  saldoPontos={saldoPontos}
                  fundoDisponivel={fundoDisponivel}
                  aoResgatar={() => setAResgatar(item)}
                  aoEditar={() => setEdicao(item)}
                  aoExcluir={() => setAExcluir(item)}
                />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="adquiridos" pt="md">
          {adquiridos.length === 0 ? (
            <Text c="dimmed">Você ainda não resgatou nenhuma recompensa.</Text>
          ) : (
            <Stack gap="sm">
              {adquiridos.map((item) => (
                <Card key={item.id} withBorder padding="md">
                  <Group justify="space-between" wrap="nowrap">
                    <div>
                      <Text fw={600}>{item.nome}</Text>
                      <Text size="xs" c="dimmed">
                        Resgatado em {item.adquiridoEm ? dataDoTimestamp(item.adquiridoEm) : '—'} ·{' '}
                        {item.pontosNecessarios} pts · {moeda(item.precoEstimado)}
                      </Text>
                    </div>
                    <Button variant="subtle" color="red" size="xs" onClick={() => setAExcluir(item)}>
                      Remover da lista
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>

      <FormularioItem
        item={edicao === 'novo' ? null : edicao}
        aberto={edicao !== null}
        aoFechar={() => setEdicao(null)}
      />
      <ResgatarModal item={aResgatar} aoFechar={() => setAResgatar(null)} />
      <ConfirmarExclusao
        aberto={aExcluir !== null}
        titulo={aExcluir?.status === 'ADQUIRIDO' ? 'Remover da lista' : 'Excluir item'}
        mensagem={
          aExcluir?.status === 'ADQUIRIDO'
            ? `Remover "${aExcluir.nome}" do histórico? Os pontos e a despesa do resgate continuam registrados.`
            : `Excluir "${aExcluir?.nome ?? ''}" da lista de desejos?`
        }
        carregando={excluir.isPending}
        aoConfirmar={() => aExcluir && excluir.mutate(aExcluir.id)}
        aoFechar={() => setAExcluir(null)}
      />
    </Stack>
  );
}