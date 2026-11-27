import { Button, Card, ColorSwatch, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import { atualizarPreferencias } from '../../api/usuario';
import { useAuth } from '../../auth/useAuth';
import { COR_PADRAO, CORES_DESTAQUE, corValida } from '../../preferencias/cores';
import { avisarErro, avisarSucesso } from '../../utils/avisos';

export function SecaoPerfil() {
  const { usuario, atualizarUsuario } = useAuth();

  const form = useForm({
    initialValues: {
      apelido: usuario?.apelido ?? '',
      corDestaque: corValida(usuario?.corDestaque ?? COR_PADRAO),
    },
    validate: {
      apelido: (valor) => (valor.trim().length <= 40 ? null : 'Use até 40 caracteres.'),
    },
  });

  const salvar = useMutation({
    mutationFn: atualizarPreferencias,
    onSuccess: (atualizado) => {
      atualizarUsuario(atualizado); // o tema e o menu mudam na hora
      avisarSucesso('Preferências salvas.');
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) form.setErrors(erro.campos);
      avisarErro(erro, 'Não foi possível salvar as preferências');
    },
  });

  const corEscolhida = CORES_DESTAQUE.find((c) => c.nome === form.values.corDestaque);

  return (
    <Card withBorder padding="lg">
      <Title order={4}>Perfil</Title>
      <Text size="sm" c="dimmed" mb="md">
        Vale para a sua conta, em qualquer aparelho.
      </Text>

      <form onSubmit={form.onSubmit((valores) => salvar.mutate(valores))}>
        <Stack>
          <TextInput
            label="Apelido"
            description="Como o app vai te chamar. Se ficar em branco, usamos o seu nome."
            placeholder={usuario?.nome}
            {...form.getInputProps('apelido')}
          />

          <div>
            <Text size="sm" fw={500} mb={6}>
              Cor de destaque
            </Text>
            <Group gap="sm">
              {CORES_DESTAQUE.map((cor) => {
                const selecionada = cor.nome === form.values.corDestaque;
                return (
                  <ColorSwatch
                    key={cor.nome}
                    component="button"
                    type="button"
                    size={34}
                    color={`var(--mantine-color-${cor.nome}-6)`}
                    onClick={() => form.setFieldValue('corDestaque', cor.nome)}
                    aria-label={cor.rotulo}
                    aria-pressed={selecionada}
                    style={{ cursor: 'pointer', color: '#fff' }}
                  >
                    {selecionada && <IconCheck size={18} />}
                  </ColorSwatch>
                );
              })}
            </Group>
            <Text size="xs" c="dimmed" mt={6}>
              Selecionada: {corEscolhida?.rotulo}
            </Text>
          </div>

          <Group justify="flex-end">
            <Button type="submit" loading={salvar.isPending}>
              Salvar alterações
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}