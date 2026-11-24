import {
  Box,
  Button,
  Center,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ApiError } from '../api/cliente';
import { useAuth } from '../auth/useAuth';
import { AlternarTema } from '../componentes/AlternarTema';

const EMAIL_VALIDO = /^\S+@\S+\.\S+$/;

function tratarErro(
  erro: unknown,
  definirErros: (erros: Record<string, string>) => void,
  titulo: string,
) {
  if (erro instanceof ApiError) {
    if (erro.campos) definirErros(erro.campos);
    notifications.show({ color: 'red', title: titulo, message: erro.message });
  } else {
    notifications.show({ color: 'red', title: titulo, message: 'Erro inesperado. Tente novamente.' });
  }
}

function FormularioLogin() {
  const { entrar } = useAuth();
  const [enviando, setEnviando] = useState(false);

  const form = useForm({
    initialValues: { email: '', senha: '' },
    validate: {
      email: (valor) => (EMAIL_VALIDO.test(valor.trim()) ? null : 'Informe um e-mail válido.'),
      senha: (valor) => (valor ? null : 'Informe a senha.'),
    },
  });

  const enviar = form.onSubmit(async (valores) => {
    setEnviando(true);
    try {
      await entrar(valores.email, valores.senha);
    } catch (erro) {
      tratarErro(erro, (erros) => form.setErrors(erros), 'Não foi possível entrar');
    } finally {
      setEnviando(false);
    }
  });

  return (
    <form onSubmit={enviar}>
      <Stack>
        <TextInput label="E-mail" placeholder="voce@email.com" {...form.getInputProps('email')} />
        <PasswordInput label="Senha" placeholder="Sua senha" {...form.getInputProps('senha')} />
        <Button type="submit" loading={enviando} fullWidth>
          Entrar
        </Button>
      </Stack>
    </form>
  );
}

function FormularioCadastro() {
  const { cadastrar } = useAuth();
  const [enviando, setEnviando] = useState(false);

  const form = useForm({
    initialValues: { nome: '', email: '', senha: '', confirmacao: '' },
    validate: {
      nome: (valor) => (valor.trim() ? null : 'Informe o nome.'),
      email: (valor) => (EMAIL_VALIDO.test(valor.trim()) ? null : 'Informe um e-mail válido.'),
      senha: (valor) =>
        valor.length >= 8 && valor.length <= 72 ? null : 'A senha deve ter de 8 a 72 caracteres.',
      confirmacao: (valor, valores) => (valor === valores.senha ? null : 'As senhas não conferem.'),
    },
  });

  const enviar = form.onSubmit(async (valores) => {
    setEnviando(true);
    try {
      await cadastrar(valores.nome, valores.email, valores.senha);
    } catch (erro) {
      tratarErro(erro, (erros) => form.setErrors(erros), 'Não foi possível criar a conta');
    } finally {
      setEnviando(false);
    }
  });

  return (
    <form onSubmit={enviar}>
      <Stack>
        <TextInput label="Nome" placeholder="Como quer ser chamada(o)" {...form.getInputProps('nome')} />
        <TextInput label="E-mail" placeholder="voce@email.com" {...form.getInputProps('email')} />
        <PasswordInput label="Senha" description="De 8 a 72 caracteres" {...form.getInputProps('senha')} />
        <PasswordInput label="Confirmar senha" {...form.getInputProps('confirmacao')} />
        <Button type="submit" loading={enviando} fullWidth>
          Criar conta
        </Button>
      </Stack>
    </form>
  );
}

export function LoginPage() {
  const { usuario, carregando } = useAuth();
  const local = useLocation();
  const destino = (local.state as { de?: string } | null)?.de ?? '/';

  if (carregando) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }
  if (usuario) {
    return <Navigate to={destino} replace />;
  }

  return (
    <Center mih="100vh" p="md">
      <Box pos="absolute" top={16} right={16}>
        <AlternarTema />
      </Box>
      <Paper withBorder shadow="md" radius="lg" p="xl" w="100%" maw={420}>
        <Stack gap={4} mb="md" align="center">
          <Title order={2}>Organização Pessoal</Title>
          <Text c="dimmed" size="sm" ta="center">
            Hábitos, finanças e recompensas em um só lugar.
          </Text>
        </Stack>
        <Tabs defaultValue="entrar">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="entrar">Entrar</Tabs.Tab>
            <Tabs.Tab value="cadastrar">Criar conta</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="entrar">
            <FormularioLogin />
          </Tabs.Panel>
          <Tabs.Panel value="cadastrar">
            <FormularioCadastro />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Center>
  );
}