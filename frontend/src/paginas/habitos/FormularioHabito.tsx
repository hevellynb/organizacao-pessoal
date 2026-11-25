import { Button, Group, Modal, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import { atualizarHabito, criarHabito, type DadosHabito, type Habito } from '../../api/habitos';
import { useAposAlterarHabitos } from '../../hooks/useAposAlterarHabitos';
import { avisarErro, avisarSucesso } from '../../utils/avisos';

interface FormularioHabitoProps {
  habito: Habito | null; // null = criando um novo
  aberto: boolean;
  aoFechar: () => void;
}

interface ValoresFormulario {
  nome: string;
  descricao: string;
  metaDescricao: string;
  metaDiasMes: number | string;
}

function Corpo({ habito, aoFechar }: { habito: Habito | null; aoFechar: () => void }) {
  const aposAlterar = useAposAlterarHabitos();

  const form = useForm<ValoresFormulario>({
    initialValues: {
      nome: habito?.nome ?? '',
      descricao: habito?.descricao ?? '',
      metaDescricao: habito?.metaDescricao ?? '',
      metaDiasMes: habito?.metaDiasMes ?? 20,
    },
    validate: {
      nome: (valor) => (valor.trim() ? null : 'Informe o nome do hábito.'),
      metaDiasMes: (valor) => {
        const numero = Number(valor);
        return Number.isInteger(numero) && numero >= 1 && numero <= 31
          ? null
          : 'Use um número de 1 a 31.';
      },
    },
  });

  const salvar = useMutation({
    mutationFn: (dados: DadosHabito) =>
      habito ? atualizarHabito(habito.id, dados) : criarHabito(dados),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso(habito ? 'Hábito atualizado.' : 'Hábito criado.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar o hábito');
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({
          nome: valores.nome.trim(),
          descricao: valores.descricao.trim(),
          metaDescricao: valores.metaDescricao.trim(),
          metaDiasMes: Number(valores.metaDiasMes),
        }),
      )}
    >
      <Stack>
        <TextInput label="Nome" placeholder="Ex.: Caminhar" data-autofocus {...form.getInputProps('nome')} />
        <Textarea label="Descrição (opcional)" autosize minRows={2} {...form.getInputProps('descricao')} />
        <TextInput
          label="Meta diária (opcional)"
          placeholder="Ex.: 30 minutos"
          description="Texto livre, só para lembrar o que conta como feito."
          {...form.getInputProps('metaDescricao')}
        />
        <NumberInput
          label="Meta de dias no mês"
          min={1}
          max={31}
          allowDecimal={false}
          {...form.getInputProps('metaDiasMes')}
        />
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

export function FormularioHabito({ habito, aberto, aoFechar }: FormularioHabitoProps) {
  return (
    <Modal opened={aberto} onClose={aoFechar} title={habito ? 'Editar hábito' : 'Novo hábito'} centered>
      {/* a "key" faz o formulário nascer do zero a cada abertura */}
      <Corpo key={habito?.id ?? 'novo'} habito={habito} aoFechar={aoFechar} />
    </Modal>
  );
}