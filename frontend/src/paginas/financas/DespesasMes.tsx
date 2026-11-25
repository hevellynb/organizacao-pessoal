import { ActionIcon, Badge, Button, Group, Menu, Select, Stack, Table, Text } from '@mantine/core';
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { excluirDespesa, listarDespesas, type Despesa, type TipoCategoria } from '../../api/financas';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { ConfirmarExclusao } from '../../componentes/ConfirmarExclusao';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { useCategorias } from '../../hooks/useCategorias';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { dataCurta, moeda } from '../../utils/formatar';
import { FormularioDespesa } from './FormularioDespesa';

export function DespesasMes({ mes }: { mes: string }) {
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [edicao, setEdicao] = useState<Despesa | 'nova' | null>(null);
  const [aExcluir, setAExcluir] = useState<Despesa | null>(null);
  const aposAlterar = useAposAlterarFinancas();

  const categorias = useCategorias();
  const despesas = useQuery({
    queryKey: ['financas', 'despesas', mes, categoriaId ?? 'todas'],
    queryFn: () => listarDespesas(mes, categoriaId),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirDespesa(id),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Despesa excluída.');
      setAExcluir(null);
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível excluir a despesa'),
  });

  if (despesas.isPending || categorias.isPending) return <Carregando />;
  if (despesas.isError) return <ErroDeCarga erro={despesas.error} aoTentar={() => despesas.refetch()} />;
  if (categorias.isError) return <ErroDeCarga erro={categorias.error} aoTentar={() => categorias.refetch()} />;

  const nomePorId = new Map(categorias.data.map((c): [string, string] => [c.id, c.nome]));
  const tipoPorId = new Map(categorias.data.map((c): [string, TipoCategoria] => [c.id, c.tipo]));
  const opcoesFiltro = categorias.data
    .filter((c) => c.tipo !== 'ECONOMIA')
    .map((c) => ({ value: c.id, label: c.nome }));
  const total = despesas.data.reduce((soma, d) => soma + d.valor, 0);

  return (
    <Stack>
      <Group justify="space-between" align="flex-end">
        <Select
            label="Filtrar por categoria"
            placeholder="Todas as categorias"
            data={opcoesFiltro}
            value={categoriaId}
            onChange={(valor) => setCategoriaId(valor == null ? null : String(valor))}
            clearable
        />
        <Button leftSection={<IconPlus size={18} />} onClick={() => setEdicao('nova')}>
          Nova despesa
        </Button>
      </Group>

      {despesas.data.length === 0 ? (
        <Text c="dimmed">Nenhuma despesa neste mês{categoriaId ? ' para esta categoria' : ''}.</Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data</Table.Th>
                  <Table.Th>Descrição</Table.Th>
                  <Table.Th>Categoria</Table.Th>
                  <Table.Th ta="right">Valor</Table.Th>
                  <Table.Th w={40} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {despesas.data.map((despesa) => {
                  // despesas do fundo vêm dos resgates: só podem ser alteradas pela tela de recompensas
                  const editavel = tipoPorId.get(despesa.categoriaId) === 'COMUM';
                  return (
                    <Table.Tr key={despesa.id}>
                      <Table.Td>{dataCurta(despesa.data)}</Table.Td>
                      <Table.Td>
                        <Text size="sm">{despesa.descricao}</Text>
                        {despesa.observacao && (
                          <Text size="xs" c="dimmed">
                            {despesa.observacao}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={editavel ? 'violet' : 'grape'}>
                          {nomePorId.get(despesa.categoriaId) ?? '—'}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right" fw={600}>
                        {moeda(despesa.valor)}
                      </Table.Td>
                      <Table.Td>
                        {editavel && (
                          <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" aria-label="Opções da despesa">
                                <IconDotsVertical size={18} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setEdicao(despesa)}>
                                Editar
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => setAExcluir(despesa)}
                              >
                                Excluir
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <Text ta="right" fw={600}>
            Total listado: {moeda(total)}
          </Text>
        </>
      )}

      <FormularioDespesa
        despesa={edicao === 'nova' ? null : edicao}
        mes={mes}
        aberto={edicao !== null}
        aoFechar={() => setEdicao(null)}
      />
      <ConfirmarExclusao
        aberto={aExcluir !== null}
        titulo="Excluir despesa"
        mensagem={`Excluir a despesa "${aExcluir?.descricao ?? ''}" de ${moeda(aExcluir?.valor ?? 0)}?`}
        carregando={excluir.isPending}
        aoConfirmar={() => aExcluir && excluir.mutate(aExcluir.id)}
        aoFechar={() => setAExcluir(null)}
      />
    </Stack>
  );
}