import { Button, Group, Modal, NumberInput, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import {
  atualizarItem,
  criarItem,
  type DadosItem,
  type ItemDesejo,
  type Prioridade,
} from '../../api/recompensas';
import { CampoDinheiro } from '../../componentes/CampoDinheiro';
import { useAposAlterarRecompensas } from '../../hooks/useAposAlterarRecompensas';
import { avisarErro, avisarSucesso } from '../../utils/avisos';

interface ValoresFormulario {
  nome: string;
  descricao: string;
  precoEstimado: number | string;
  pontosNecessarios: number | string; // '' = usar a sugestão
  prioridade: Prioridade;
}

/** Tabela do documento: até R$30 = 1, até R$60 = 2, até R$90 = 3; acima, 1 ponto a cada R$30. */
function sugerirPontos(preco: number): number {
  return Math.max(1, Math.ceil(preco / 30));
}

function Corpo({ item, aoFechar }: { item: ItemDesejo | null; aoFechar: () => void }) {
  const aposAlterar = useAposAlterarRecompensas();

  const form = useForm<ValoresFormulario>({
    initialValues: {
      nome: item?.nome ?? '',
      descricao: item?.descricao ?? '',
      precoEstimado: item?.precoEstimado ?? '',
      pontosNecessarios: item?.pontosNecessarios ?? '',
      prioridade: item?.prioridade ?? 'MEDIA',
    },
    validate: {
      nome: (v) => (v.trim() ? null : 'Informe o nome do item.'),
      precoEstimado: (v) => (v !== '' && Number(v) >= 0 ? null : 'Informe o preço estimado.'),
      pontosNecessarios: (v) => {
        if (v === '') return null;
        const numero = Number(v);
        return Number.isInteger(numero) && numero >= 1 && numero <= 1000
          ? null
          : 'Use um número inteiro de 1 a 1000.';
      },
    },
  });

  const salvar = useMutation({
    mutationFn: (dados: DadosItem) => (item ? atualizarItem(item.id, dados) : criarItem(dados)),
    onSuccess: async () => {
      await aposAlterar();
      avisarSucesso(item ? 'Item atualizado.' : 'Item adicionado à lista.');
      aoFechar();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar o item');
    },
  });

  const sugestao = sugerirPontos(Number(form.values.precoEstimado) || 0);

  return (
    <form
      onSubmit={form.onSubmit((valores) =>
        salvar.mutate({
          nome: valores.nome.trim(),
          descricao: valores.descricao.trim(),
          precoEstimado: Number(valores.precoEstimado),
          pontosNecessarios: valores.pontosNecessarios === '' ? null : Number(valores.pontosNecessarios),
          prioridade: valores.prioridade,
        }),
      )}
    >
      <Stack>
        <TextInput label="Nome" placeholder="Ex.: Fone de ouvido" data-autofocus {...form.getInputProps('nome')} />
        <TextInput label="Descrição (opcional)" {...form.getInputProps('descricao')} />
        <CampoDinheiro label="Preço estimado" {...form.getInputProps('precoEstimado')} />
        <NumberInput
          label="Pontos necessários"
          placeholder="Automático"
          min={1}
          max={1000}
          allowDecimal={false}
          description={`Em branco, usamos a sugestão pela tabela do documento: ${sugestao} ponto(s).`}
          {...form.getInputProps('pontosNecessarios')}
        />
        <div>
          <Text size="sm" fw={500} mb={4}>
            Prioridade
          </Text>
          <SegmentedControl
            fullWidth
            value={form.values.prioridade}
            onChange={(valor) => form.setFieldValue('prioridade', valor as Prioridade)}
            data={[
              { value: 'ALTA', label: 'Alta' },
              { value: 'MEDIA', label: 'Média' },
              { value: 'BAIXA', label: 'Baixa' },
            ]}
          />
        </div>
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

interface FormularioItemProps {
  item: ItemDesejo | null; // null = adicionando um novo
  aberto: boolean;
  aoFechar: () => void;
}

export function FormularioItem({ item, aberto, aoFechar }: FormularioItemProps) {
  return (
    <Modal opened={aberto} onClose={aoFechar} title={item ? 'Editar item' : 'Novo item'} centered>
      <Corpo key={item?.id ?? 'novo'} item={item} aoFechar={aoFechar} />
    </Modal>
  );
}