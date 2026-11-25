import { ActionIcon, Alert, Button, Group, Stack, Tabs, Text, TextInput, Title } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import type { Habito } from '../../api/habitos';
import {
  dataPorExtenso,
  hojeISO,
  mesDe,
  nomeDoMes,
  somarDias,
  somarMeses,
} from '../../utils/formatar';
import { FormularioHabito } from './FormularioHabito';
import { GerenciarHabitos } from './GerenciarHabitos';
import { ListaDoDia } from './ListaDoDia';
import { ResumoDoMes } from './ResumoDoMes';

export function HabitosPage() {
  const hoje = hojeISO();
  const [dia, setDia] = useState(hoje);
  const [edicao, setEdicao] = useState<Habito | 'novo' | null>(null);

  const mes = mesDe(dia);
  const ehFuturo = dia > hoje; // textos "AAAA-MM-DD" comparam como datas

  function irParaMesSeguinte() {
    const proximo = somarMeses(dia, 1);
    setDia(mesDe(proximo) === mesDe(hoje) ? hoje : proximo);
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Hábitos</Title>
          <Text c="dimmed">{dataPorExtenso(dia)}</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={() => setEdicao('novo')}>
          Novo hábito
        </Button>
      </Group>

      <Group gap="xs">
        <ActionIcon
          variant="default"
          size="lg"
          aria-label="Dia anterior"
          onClick={() => setDia(somarDias(dia, -1))}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
        <TextInput
          type="date"
          value={dia}
          max={hoje}
          aria-label="Escolher o dia"
          onChange={(evento) => {
            const valor = evento.currentTarget.value;
            if (valor) setDia(valor);
          }}
        />
        <ActionIcon
          variant="default"
          size="lg"
          aria-label="Próximo dia"
          disabled={dia >= hoje}
          onClick={() => setDia(somarDias(dia, 1))}
        >
          <IconChevronRight size={18} />
        </ActionIcon>
        <Button variant="light" disabled={dia === hoje} onClick={() => setDia(hoje)}>
          Hoje
        </Button>
      </Group>

      <Tabs defaultValue="dia" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="dia">Lista do dia</Tabs.Tab>
          <Tabs.Tab value="mes">Mês</Tabs.Tab>
          <Tabs.Tab value="gerenciar">Gerenciar</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dia" pt="md">
          {ehFuturo && (
            <Alert icon={<IconInfoCircle />} color="yellow" mb="md">
              Não é possível registrar hábitos em datas futuras.
            </Alert>
          )}
          <ListaDoDia dia={dia} ehFuturo={ehFuturo} />
        </Tabs.Panel>

        <Tabs.Panel value="mes" pt="md">
          <Group justify="center" mb="md">
            <ActionIcon
              variant="default"
              aria-label="Mês anterior"
              onClick={() => setDia(somarMeses(dia, -1))}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Text fw={600} w={190} ta="center">
              {nomeDoMes(mes)}
            </Text>
            <ActionIcon
              variant="default"
              aria-label="Mês seguinte"
              disabled={mes >= mesDe(hoje)}
              onClick={irParaMesSeguinte}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
          <ResumoDoMes mes={mes} />
        </Tabs.Panel>

        <Tabs.Panel value="gerenciar" pt="md">
          <GerenciarHabitos aoEditar={setEdicao} />
        </Tabs.Panel>
      </Tabs>

      <FormularioHabito
        habito={edicao === 'novo' ? null : edicao}
        aberto={edicao !== null}
        aoFechar={() => setEdicao(null)}
      />
    </Stack>
  );
}