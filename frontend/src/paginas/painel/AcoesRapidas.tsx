import { Button, Group } from '@mantine/core';
import { IconGift, IconPigMoney, IconReceipt } from '@tabler/icons-react';
import { useState } from 'react';
import type { DestinoAporte } from '../../api/financas';
import { mesAtual } from '../../utils/formatar';
import { FormularioAporte } from '../financas/FormularioAporte';
import { FormularioDespesa } from '../financas/FormularioDespesa';

export function AcoesRapidas() {
  const [despesaAberta, setDespesaAberta] = useState(false);
  const [aporte, setAporte] = useState<DestinoAporte | null>(null);
  const mes = mesAtual();

  return (
    <>
      <Group gap="xs">
        <Button variant="light" leftSection={<IconReceipt size={16} />} onClick={() => setDespesaAberta(true)}>
          Lançar despesa
        </Button>
        <Button variant="light" leftSection={<IconPigMoney size={16} />} onClick={() => setAporte('RESERVA')}>
          Aportar na reserva
        </Button>
        <Button variant="light" leftSection={<IconGift size={16} />} onClick={() => setAporte('FUNDO')}>
          Aportar no fundo
        </Button>
      </Group>

      {/* as mesmas janelas das telas de Finanças: aqui só as abrimos */}
      <FormularioDespesa despesa={null} mes={mes} aberto={despesaAberta} aoFechar={() => setDespesaAberta(false)} />
      <FormularioAporte destino={aporte} mes={mes} aoFechar={() => setAporte(null)} />
    </>
  );
}