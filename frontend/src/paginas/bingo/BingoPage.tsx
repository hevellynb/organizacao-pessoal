import { Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { NavegadorDeMes } from '../../componentes/NavegadorDeMes';
import { mesAtual, nomeDoMes } from '../../utils/formatar';
import { CartelaBingo } from './CartelaBingo';
import { PontosBingo } from './PontosBingo';

export function BingoPage() {
  const [mes, setMes] = useState(mesAtual());

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Bingo</Title>
          <Text c="dimmed">{nomeDoMes(mes)}</Text>
        </div>
        <NavegadorDeMes mes={mes} aoMudar={setMes} />
      </Group>

      <Tabs defaultValue="cartela" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="cartela">Cartela</Tabs.Tab>
          <Tabs.Tab value="pontos">Pontos</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="cartela" pt="md">
          <CartelaBingo key={mes} mes={mes} />
        </Tabs.Panel>
        <Tabs.Panel value="pontos" pt="md">
          <PontosBingo />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}