import { ActionIcon, Button, Group, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { mesAtual, mesDe, nomeDoMes, somarMeses } from '../utils/formatar';

interface NavegadorDeMesProps {
  mes: string;
  aoMudar: (novoMes: string) => void;
}

export function NavegadorDeMes({ mes, aoMudar }: NavegadorDeMesProps) {
  const mudar = (quantidade: number) => aoMudar(mesDe(somarMeses(`${mes}-01`, quantidade)));

  return (
    <Group gap="xs">
      <ActionIcon variant="default" size="lg" aria-label="Mês anterior" onClick={() => mudar(-1)}>
        <IconChevronLeft size={18} />
      </ActionIcon>
      <Text fw={600} w={170} ta="center">
        {nomeDoMes(mes)}
      </Text>
      <ActionIcon variant="default" size="lg" aria-label="Mês seguinte" onClick={() => mudar(1)}>
        <IconChevronRight size={18} />
      </ActionIcon>
      <Button variant="light" disabled={mes === mesAtual()} onClick={() => aoMudar(mesAtual())}>
        Este mês
      </Button>
    </Group>
  );
}