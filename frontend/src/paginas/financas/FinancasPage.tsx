import { Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { NavegadorDeMes } from '../../componentes/NavegadorDeMes';
import { mesAtual, nomeDoMes } from '../../utils/formatar';
import { AportesMes } from './AporteMes';
import { DespesasMes } from './DespesasMes';
import { GerenciarCategorias } from './GerenciarCategorias';
import { ResumoFinanceiro } from './ResumoFinanceiro';

export function FinancasPage() {
  const [mes, setMes] = useState(mesAtual());

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Finanças</Title>
          <Text c="dimmed">{nomeDoMes(mes)}</Text>
        </div>
        <NavegadorDeMes mes={mes} aoMudar={setMes} />
      </Group>

      <Tabs defaultValue="resumo" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="resumo">Resumo</Tabs.Tab>
          <Tabs.Tab value="despesas">Despesas</Tabs.Tab>
          <Tabs.Tab value="aportes">Aportes</Tabs.Tab>
          <Tabs.Tab value="categorias">Categorias</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="resumo" pt="md">
          <ResumoFinanceiro mes={mes} />
        </Tabs.Panel>
        <Tabs.Panel value="despesas" pt="md">
          <DespesasMes mes={mes} />
        </Tabs.Panel>
        <Tabs.Panel value="aportes" pt="md">
          <AportesMes mes={mes} />
        </Tabs.Panel>
        <Tabs.Panel value="categorias" pt="md">
          <GerenciarCategorias />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}