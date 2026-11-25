import { Button, Group, Modal, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import { registrarAporte, type DadosAporte, type DestinoAporte } from '../../api/financas';
import { CampoDinheiro } from '../../componentes/CampoDinheiro';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { hojeISO, ultimoDiaDoMes } from '../../utils/formatar';

interface ValoresFormulario {
  destino: DestinoAporte;
  valor: number | string;
  data: string;
  observacao: string;
}

interface CorpoProps {
  destinoInicial: DestinoAporte;
  mes: string;
  aoFechar: () => void;
}

function Corpo({ destinoInicial, mes, aoFechar }: CorpoProps) {
  const aposAlterar = useAposAlterarFinancas();

  // aportes não podem ter data futura: o limite é "hoje" ou o fim do mês, o que vier primeiro
  const primeiroDia = `${mes}-01`;
  const hoje = hojeISO();
  const fimDoMes = ultimoDiaDoMes(mes);
  const limite = hoje < fimDoMes ? hoje : fimDoMes;

  const form = useForm<ValoresFormulario>({
    initialValues: { destino: destinoInicial, valor: '', data: limite, observacao: '' },
    validate: {
      valor: (v) => (v !== '' && Number(v) > 0 ? null : 'Informe um valor maior que zero.'),
      data: (v) => (v >= primeiroDia && v <= limite ? null : 'Use uma data deste mês, até hoje.'),
    },
  });

  const salvar = useMutation({
    mutationFn: (dados: DadosAporte) => registrarAporte(dados),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso('Aporte registrado.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível registrar o aporte');
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({
          destino: valores.destino,
          valor: Number(valores.valor),
          data: valores.data,
          observacao: valores.observacao.trim(),
        }),
      )}
    >
      <Stack>
        <div>
          <Text size="sm" fw={500} mb={4}>
            Destino
          </Text>
          <SegmentedControl
            fullWidth
            value={form.values.destino}
            onChange={(valor) => form.setFieldValue('destino', valor as DestinoAporte)}
            data={[
              { value: 'RESERVA', label: 'Reserva' },
              { value: 'FUNDO', label: 'Fundo de recompensas' },
            ]}
          />
        </div>
        <CampoDinheiro label="Valor guardado" data-autofocus {...form.getInputProps('valor')} />
        <TextInput
          type="date"
          label="Data"
          min={primeiroDia}
          max={limite}
          {...form.getInputProps('data')}
        />
        <TextInput
          label="Observação (opcional)"
          placeholder="Ex.: sobra do mês"
          {...form.getInputProps('observacao')}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvar.isPending}>
            Registrar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

interface FormularioAporteProps {
  destino: DestinoAporte | null; // null = janela fechada
  mes: string;
  aoFechar: () => void;
}

export function FormularioAporte({ destino, mes, aoFechar }: FormularioAporteProps) {
  return (
    <Modal opened={destino !== null} onClose={aoFechar} title="Novo aporte" centered>
      {destino && <Corpo key={destino} destinoInicial={destino} mes={mes} aoFechar={aoFechar} />}
    </Modal>
  );
}