import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import {
  atualizarCategoria,
  criarCategoria,
  type Categoria,
  type DadosCategoria,
} from '../../api/financas';
import { CampoDinheiro } from '../../componentes/CampoDinheiro';
import { useAposAlterarFinancas } from '../../hooks/useAposAlterarFinancas';
import { avisarErro, avisarSucesso } from '../../utils/avisos';

interface ValoresFormulario {
  nome: string;
  orcamentoMensal: number | string;
}

function Corpo({ categoria, aoFechar }: { categoria: Categoria | null; aoFechar: () => void }) {
  const aposAlterar = useAposAlterarFinancas();
  const especial = categoria !== null && categoria.tipo !== 'COMUM';

  const form = useForm<ValoresFormulario>({
    initialValues: {
      nome: categoria?.nome ?? '',
      orcamentoMensal: categoria?.orcamentoMensal ?? '',
    },
    validate: {
      nome: (v) => (v.trim() ? null : 'Informe o nome da categoria.'),
      orcamentoMensal: (v) => (v !== '' && Number(v) >= 0 ? null : 'Informe o orçamento.'),
    },
  });

  const salvar = useMutation({
    mutationFn: (dados: DadosCategoria) =>
      categoria ? atualizarCategoria(categoria.id, dados) : criarCategoria(dados),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso(categoria ? 'Categoria atualizada.' : 'Categoria criada.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar a categoria');
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({ nome: valores.nome.trim(), orcamentoMensal: Number(valores.orcamentoMensal) }),
      )}
    >
      <Stack>
        <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
        <CampoDinheiro
          label={especial ? 'Meta mensal de aporte' : 'Limite de gasto no mês'}
          {...form.getInputProps('orcamentoMensal')}
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

interface FormularioCategoriaProps {
  categoria: Categoria | null; // null = criando uma nova
  aberto: boolean;
  aoFechar: () => void;
}

export function FormularioCategoria({ categoria, aberto, aoFechar }: FormularioCategoriaProps) {
  return (
    <Modal
      opened={aberto}
      onClose={aoFechar}
      title={categoria ? 'Editar categoria' : 'Nova categoria'}
      centered
    >
      <Corpo key={categoria?.id ?? 'nova'} categoria={categoria} aoFechar={aoFechar} />
    </Modal>
  );
}