import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import {
  atualizarDespesa,
  lancarDespesa,
  type DadosDespesa,
  type Despesa,
} from '../../api/financas';
import { CampoDinheiro } from '../../componentes/CampoDinheiro';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { useCategorias } from '../../hooks/useCategorias';
import { avisarErro, avisarSucesso } from '../../utils/avisos';
import { hojeISO, mesAtual, ultimoDiaDoMes } from '../../utils/formatar';

interface ValoresFormulario {
  descricao: string;
  valor: number | string;
  categoriaId: string | null;
  data: string;
  observacao: string;
}

interface CorpoProps {
  despesa: Despesa | null;
  mes: string;
  aoFechar: () => void;
}

function Corpo({ despesa, mes, aoFechar }: CorpoProps) {
  const aposAlterar = useAposAlterarFinancas();
  const categorias = useCategorias();

  const primeiroDia = `${mes}-01`;
  const ultimoDia = ultimoDiaDoMes(mes);
  const diaInicial = mes === mesAtual() ? hojeISO() : primeiroDia;

  const form = useForm<ValoresFormulario>({
    initialValues: {
      descricao: despesa?.descricao ?? '',
      valor: despesa?.valor ?? '',
      categoriaId: despesa?.categoriaId ?? null,
      data: despesa?.data ?? diaInicial,
      observacao: despesa?.observacao ?? '',
    },
    validate: {
      descricao: (v) => (v.trim() ? null : 'Informe a descrição.'),
      valor: (v) => (v !== '' && Number(v) > 0 ? null : 'Informe um valor maior que zero.'),
      categoriaId: (v) => (v ? null : 'Escolha a categoria.'),
      data: (v) => (v >= primeiroDia && v <= ultimoDia ? null : 'Use uma data dentro do mês exibido.'),
    },
  });

  const salvar = useMutation({
    mutationFn: (dados: DadosDespesa) =>
      despesa ? atualizarDespesa(despesa.id, dados) : lancarDespesa(dados),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso(despesa ? 'Despesa atualizada.' : 'Despesa lançada.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar a despesa');
    },
  });

  // reserva e fundo recebem aportes, não despesas: só categorias comuns aparecem aqui
  const opcoes = (categorias.data ?? [])
    .filter((c) => c.tipo === 'COMUM')
    .map((c) => ({ value: c.id, label: c.nome }));

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({
          descricao: valores.descricao.trim(),
          valor: Number(valores.valor),
          categoriaId: valores.categoriaId ?? '',
          data: valores.data,
          observacao: valores.observacao.trim(),
        }),
      )}
    >
      <Stack>
        <TextInput
          label="Descrição"
          placeholder="Ex.: Ônibus"
          data-autofocus
          {...form.getInputProps('descricao')}
        />
        <CampoDinheiro label="Valor" {...form.getInputProps('valor')} />
        <Select
          label="Categoria"
          placeholder="Escolha"
          data={opcoes}
          {...form.getInputProps('categoriaId')}
        />
        <TextInput
          type="date"
          label="Data"
          min={primeiroDia}
          max={ultimoDia}
          {...form.getInputProps('data')}
        />
        <TextInput label="Observação (opcional)" {...form.getInputProps('observacao')} />
        <Group justify="flex-end" mt="sm">
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

interface FormularioDespesaProps {
  despesa: Despesa | null; // null = lançando uma nova
  mes: string;
  aberto: boolean;
  aoFechar: () => void;
}

export function FormularioDespesa({ despesa, mes, aberto, aoFechar }: FormularioDespesaProps) {
  return (
    <Modal opened={aberto} onClose={aoFechar} title={despesa ? 'Editar despesa' : 'Nova despesa'} centered>
      <Corpo key={despesa?.id ?? 'nova'} despesa={despesa} mes={mes} aoFechar={aoFechar} />
    </Modal>
  );
}