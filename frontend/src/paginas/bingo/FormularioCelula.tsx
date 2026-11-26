import { Button, Group, Modal, NumberInput, SegmentedControl, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import {
  definirCelula,
  limparCelula,
  type CelulaCartela,
  type DadosCelula,
  type TipoCelula,
} from '../../api/bingo';
import { listarHabitos } from '../../api/habitos';
import { useAposAlterarBingo } from '../../hooks/useAposAlterarBingo';
import { useCategorias } from '../../hooks/useCategorias';
import { avisarErro, avisarSucesso } from '../../utils/avisos';

interface ValoresFormulario {
  titulo: string;
  tipo: TipoCelula;
  habitoId: string | null;
  metaDias: number | string;
  categoriaId: string | null;
}

interface CorpoProps {
  mes: string;
  posicao: number;
  celula: CelulaCartela | null;
  aoFechar: () => void;
}

function Corpo({ mes, posicao, celula, aoFechar }: CorpoProps) {
  const aposAlterar = useAposAlterarBingo(mes);
  const habitos = useQuery({ queryKey: ['habitos', 'lista'], queryFn: listarHabitos });
  const categorias = useCategorias();
  const existente = celula !== null && celula.definida;

  const form = useForm<ValoresFormulario>({
    initialValues: {
      titulo: celula?.titulo ?? '',
      tipo: celula?.tipo ?? 'MANUAL',
      habitoId: celula?.habitoId ?? null,
      metaDias: celula?.metaDias ?? 20,
      categoriaId: celula?.categoriaId ?? null,
    },
    validate: {
      titulo: (v) => (v.trim() ? null : 'Descreva o desafio.'),
      habitoId: (v, valores) => (valores.tipo === 'HABITO' && !v ? 'Escolha o hábito.' : null),
      metaDias: (v, valores) => {
        if (valores.tipo !== 'HABITO') return null;
        const numero = Number(v);
        return Number.isInteger(numero) && numero >= 1 && numero <= 31 ? null : 'Use de 1 a 31 dias.';
      },
      categoriaId: (v, valores) => (valores.tipo === 'FINANCEIRA' && !v ? 'Escolha a categoria.' : null),
    },
  });

  const salvar = useMutation({
    mutationFn: (dados: DadosCelula) => definirCelula(mes, posicao, dados),
    onSuccess: async (cartela) => {
      await aposAlterar(cartela);
      avisarSucesso(existente ? 'Desafio atualizado.' : 'Desafio criado.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar o desafio');
    },
  });

  const limpar = useMutation({
    mutationFn: () => limparCelula(mes, posicao),
    onSuccess: async (cartela) => {
      await aposAlterar(cartela);
      avisarSucesso('Célula limpa.');
      aoFechar();
    },
    onError: (erro) => avisarErro(erro, 'Não foi possível limpar a célula'),
  });

  const opcoesHabitos = (habitos.data ?? []).map((h) => ({ value: h.id, label: h.nome }));
  const opcoesCategorias = (categorias.data ?? []).map((c) => ({ value: c.id, label: c.nome }));
  const categoriaEscolhida = (categorias.data ?? []).find((c) => c.id === form.values.categoriaId);

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({
          titulo: valores.titulo.trim(),
          tipo: valores.tipo,
          habitoId: valores.tipo === 'HABITO' ? valores.habitoId : null,
          metaDias: valores.tipo === 'HABITO' ? Number(valores.metaDias) : null,
          categoriaId: valores.tipo === 'FINANCEIRA' ? valores.categoriaId : null,
        }),
      )}
    >
      <Stack>
        <TextInput
          label="Desafio"
          placeholder="Ex.: Caminhar 20 dias"
          data-autofocus
          {...form.getInputProps('titulo')}
        />

        <div>
          <Text size="sm" fw={500} mb={4}>
            Como ele é concluído?
          </Text>
          <SegmentedControl
            fullWidth
            value={form.values.tipo}
            onChange={(valor) => form.setFieldValue('tipo', valor as TipoCelula)}
            data={[
              { value: 'HABITO', label: 'Hábito' },
              { value: 'FINANCEIRA', label: 'Financeiro' },
              { value: 'MANUAL', label: 'Manual' },
            ]}
          />
        </div>

        {form.values.tipo === 'HABITO' && (
          <>
            <Select
              label="Hábito"
              placeholder="Escolha o hábito"
              data={opcoesHabitos}
              nothingFoundMessage="Nenhum hábito cadastrado"
              value={form.values.habitoId}
              onChange={(valor) => form.setFieldValue('habitoId', valor == null ? null : String(valor))}
              error={form.errors.habitoId}
            />
            <NumberInput
              label="Quantos dias no mês?"
              min={1}
              max={31}
              allowDecimal={false}
              description="A célula é marcada sozinha quando o hábito atingir essa quantidade de dias."
              {...form.getInputProps('metaDias')}
            />
          </>
        )}

        {form.values.tipo === 'FINANCEIRA' && (
          <Select
            label="Categoria"
            placeholder="Escolha a categoria"
            data={opcoesCategorias}
            value={form.values.categoriaId}
            onChange={(valor) => form.setFieldValue('categoriaId', valor == null ? null : String(valor))}
            error={form.errors.categoriaId}
            description={
              categoriaEscolhida
                ? categoriaEscolhida.tipo === 'COMUM'
                  ? 'Concluída se o gasto do mês ficar dentro do limite (avaliada quando o mês terminar).'
                  : 'Concluída quando os aportes do mês atingirem a meta mensal.'
                : 'Escolha uma categoria para ver como a meta é avaliada.'
            }
          />
        )}

        {form.values.tipo === 'MANUAL' && (
          <Text size="sm" c="dimmed">
            Você marca como concluído no botão redondo da célula.
          </Text>
        )}

        <Group justify="space-between" mt="sm">
          <div>
            {existente && (
              <Button variant="subtle" color="red" loading={limpar.isPending} onClick={() => limpar.mutate()}>
                Limpar célula
              </Button>
            )}
          </div>
          <Group>
            <Button variant="default" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" loading={salvar.isPending}>
              Salvar
            </Button>
          </Group>
        </Group>
      </Stack>
    </form>
  );
}

interface FormularioCelulaProps {
  mes: string;
  posicao: number | null; // null = janela fechada
  celula: CelulaCartela | null;
  aoFechar: () => void;
}

export function FormularioCelula({ mes, posicao, celula, aoFechar }: FormularioCelulaProps) {
  return (
    <Modal
      opened={posicao !== null}
      onClose={aoFechar}
      title={celula?.definida ? 'Editar desafio' : 'Novo desafio'}
      centered
    >
      {posicao !== null && (
        <Corpo key={`${mes}-${posicao}`} mes={mes} posicao={posicao} celula={celula} aoFechar={aoFechar} />
      )}
    </Modal>
  );
}