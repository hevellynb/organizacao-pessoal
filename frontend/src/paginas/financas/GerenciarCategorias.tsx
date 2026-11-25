import { ActionIcon, Badge, Button, Card, Group, Menu, Stack, Text } from '@mantine/core';
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { excluirCategoria, type Categoria, type TipoCategoria } from '../../api/financas';
import { ConfirmarExclusao } from '../../componentes/ConfirmarExclusao';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { useCategorias } from '../../hooks/useCategorias';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { moeda } from '../../utils/formatar';
import { FormularioCategoria } from './FormularioCategoria';

const ROTULO_TIPO: Record<TipoCategoria, string> = {
  COMUM: 'Categoria',
  ECONOMIA: 'Reserva',
  FUNDO_RECOMPENSAS: 'Fundo de recompensas',
};

export function GerenciarCategorias() {
  const categorias = useCategorias();
  const [edicao, setEdicao] = useState<Categoria | 'nova' | null>(null);
  const [aExcluir, setAExcluir] = useState<Categoria | null>(null);
  const aposAlterar = useAposAlterarFinancas();

  const excluir = useMutation({
    mutationFn: (id: string) => excluirCategoria(id),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Categoria excluída.');
      setAExcluir(null);
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível excluir a categoria'),
  });

  if (categorias.isPending) return <Carregando />;
  if (categorias.isError) return <ErroDeCarga erro={categorias.error} aoTentar={() => categorias.refetch()} />;

  const total = categorias.data.reduce((soma, c) => soma + c.orcamentoMensal, 0);

  return (
    <Stack>
      <Group justify="space-between">
        <Text c="dimmed">Orçamento total planejado: {moeda(total)}</Text>
        <Button leftSection={<IconPlus size={18} />} onClick={() => setEdicao('nova')}>
          Nova categoria
        </Button>
      </Group>

      {categorias.data.map((categoria) => {
        const especial = categoria.tipo !== 'COMUM';
        return (
          <Card key={categoria.id} withBorder padding="md">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Group gap="xs">
                  <Text fw={600}>{categoria.nome}</Text>
                  <Badge variant="light" color={especial ? 'grape' : 'violet'}>
                    {ROTULO_TIPO[categoria.tipo]}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {especial ? 'Meta mensal de aporte' : 'Limite de gasto no mês'}: {moeda(categoria.orcamentoMensal)}
                </Text>
              </div>

              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" aria-label={`Opções de ${categoria.nome}`}>
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setEdicao(categoria)}>
                    Editar
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    disabled={especial}
                    leftSection={<IconTrash size={16} />}
                    onClick={() => setAExcluir(categoria)}
                  >
                    Excluir
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Card>
        );
      })}

      <FormularioCategoria
        categoria={edicao === 'nova' ? null : edicao}
        aberto={edicao !== null}
        aoFechar={() => setEdicao(null)}
      />
      <ConfirmarExclusao
        aberto={aExcluir !== null}
        titulo="Excluir categoria"
        mensagem={`Excluir a categoria "${aExcluir?.nome ?? ''}"? Só é possível se ela não tiver despesas.`}
        carregando={excluir.isPending}
        aoConfirmar={() => aExcluir && excluir.mutate(aExcluir.id)}
        aoFechar={() => setAExcluir(null)}
      />
    </Stack>
  );
}