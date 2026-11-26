import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { resgatarItem, type ItemDesejo } from '../../api/recompensas';
import { CampoDinheiro } from '../../componentes/CampoDinheiro';
import { useAposAlterarRecompensas } from '../../hooks/useAposAlterarRecompensas';
import { avisarErro } from '../../utils/avisos';
import { moeda } from '../../utils/formatar';

function Corpo({ item, aoFechar }: { item: ItemDesejo; aoFechar: () => void }) {
  const aposAlterar = useAposAlterarRecompensas();

  const form = useForm<{ valorPago: number | string }>({
    initialValues: { valorPago: item.precoEstimado },
    validate: {
      valorPago: (v) => (v !== '' && Number(v) > 0 ? null : 'Informe um valor maior que zero.'),
    },
  });

  const resgatar = useMutation({
    mutationFn: (valor: number) => resgatarItem(item.id, valor),
    onSuccess: async (resultado) => {
      await aposAlterar();
      notifications.show({
        color: 'teal',
        title: 'Recompensa resgatada! 🎉',
        message: `${resultado.item.nome}: -${resultado.pontosGastos} ponto(s) e ${moeda(resultado.valorLancado)} do fundo.`,
      });
      aoFechar();
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível resgatar'),
  });

  return (
    <form onSubmit={form.onSubmit((valores) => resgatar.mutate(Number(valores.valorPago)))}>
      <Stack>
        <Text>
          Resgatar{' '}
          <Text span fw={700}>
            {item.nome}
          </Text>{' '}
          vai gastar <b>{item.pontosNecessarios} ponto(s)</b> e tirar o valor pago do fundo de recompensas.
        </Text>
        <CampoDinheiro
          label="Valor realmente pago"
          description={`Estimado: ${moeda(item.precoEstimado)}. Se pagou outro valor, informe aqui.`}
          data-autofocus
          {...form.getInputProps('valorPago')}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" loading={resgatar.isPending}>
            Confirmar resgate
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

interface ResgatarModalProps {
  item: ItemDesejo | null; // null = janela fechada
  aoFechar: () => void;
}

export function ResgatarModal({ item, aoFechar }: ResgatarModalProps) {
  return (
    <Modal opened={item !== null} onClose={aoFechar} title="Resgatar recompensa" centered>
      {item && <Corpo key={item.id} item={item} aoFechar={aoFechar} />}
    </Modal>
  );
}