import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  Progress,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconDotsVertical, IconHistory, IconPencil, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { buscarHistorico, excluirHabito, listarHabitos, type Habito } from '../../api/habitos';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarHabitos } from '../../hooks/useAposAlterarHabitos';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { nomeDoMes } from '../../utils/formatar';

function HistoricoModal({ habito, aoFechar }: { habito: Habito | null; aoFechar: () => void }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['habitos', 'historico', habito?.id],
    queryFn: () => buscarHistorico(habito?.id ?? ''),
    enabled: habito !== null, // só busca quando a janela está aberta
  });

  return (
    <Modal opened={habito !== null} onClose={aoFechar} title={`Histórico: ${habito?.nome ?? ''}`} centered>
      {isPending ? (
        <Carregando />
      ) : isError ? (
        <Text c="red">{error.message}</Text>
      ) : data.length === 0 ? (
        <Text c="dimmed">Ainda não há registros para este hábito.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Mês</Table.Th>
              <Table.Th>Dias</Table.Th>
              <Table.Th>Meta</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[...data].reverse().map((linha) => {
              const meta = habito?.metaDiasMes ?? 0;
              return (
                <Table.Tr key={linha.mes}>
                  <Table.Td>{nomeDoMes(linha.mes)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm">{linha.dias}</Text>
                      <Progress
                        value={meta > 0 ? Math.min(100, (linha.dias / meta) * 100) : 0}
                        w={60}
                        size="sm"
                        radius="xl"
                      />
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {linha.dias >= meta ? (
                      <Badge color="teal" variant="light">
                        Batida
                      </Badge>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {meta} dias
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}

function ConfirmarExclusao({ habito, aoFechar }: { habito: Habito | null; aoFechar: () => void }) {
  const aposAlterar = useAposAlterarHabitos();

  const excluir = useMutation({
    mutationFn: () => excluirHabito(habito?.id ?? ''),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Hábito excluído.');
      aoFechar();
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível excluir o hábito'),
  });

  return (
    <Modal opened={habito !== null} onClose={aoFechar} title="Excluir hábito" centered>
      <Text>
        Excluir{' '}
        <Text span fw={700}>
          {habito?.nome}
        </Text>
        ? Todo o histórico dele será apagado, e as células do bingo ligadas a ele ficarão sem hábito.
      </Text>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button color="red" loading={excluir.isPending} onClick={() => excluir.mutate()}>
          Excluir
        </Button>
      </Group>
    </Modal>
  );
}

export function GerenciarHabitos({ aoEditar }: { aoEditar: (habito: Habito) => void }) {
  const {
    data: habitos,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({ queryKey: ['habitos', 'lista'], queryFn: listarHabitos });
  const [verHistorico, setVerHistorico] = useState<Habito | null>(null);
  const [aExcluir, setAExcluir] = useState<Habito | null>(null);

  if (isPending) return <Carregando />;
  if (isError) return <ErroDeCarga erro={error} aoTentar={() => refetch()} />;
  if (habitos.length === 0) return <Text c="dimmed">Nenhum hábito cadastrado ainda.</Text>;

  return (
    <Stack>
      {habitos.map((habito) => (
        <Card key={habito.id} withBorder padding="md">
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <div>
              <Text fw={600}>{habito.nome}</Text>
              {habito.descricao && (
                <Text size="sm" c="dimmed">
                  {habito.descricao}
                </Text>
              )}
              <Group gap="xs" mt={8}>
                <Badge variant="light">Meta: {habito.metaDiasMes} dias/mês</Badge>
                {habito.metaDescricao && (
                  <Badge variant="outline" color="gray">
                    {habito.metaDescricao}
                  </Badge>
                )}
              </Group>
            </div>

            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label={`Opções de ${habito.nome}`}>
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => aoEditar(habito)}>
                  Editar
                </Menu.Item>
                <Menu.Item leftSection={<IconHistory size={16} />} onClick={() => setVerHistorico(habito)}>
                  Histórico
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => setAExcluir(habito)}>
                  Excluir
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Card>
      ))}

      <HistoricoModal habito={verHistorico} aoFechar={() => setVerHistorico(null)} />
      <ConfirmarExclusao habito={aExcluir} aoFechar={() => setAExcluir(null)} />
    </Stack>
  );
}