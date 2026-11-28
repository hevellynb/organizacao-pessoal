import { Button, Card, Group, SegmentedControl, Stack, Switch, Text, Title, useMantineColorScheme } from '@mantine/core';
import type { ReactNode } from 'react';
import {
  usePreferenciasDispositivo,
  type Cantos,
  type TamanhoTexto,
} from '../../preferencias/dispositivo';
import type { EstiloEscuro } from '../../preferencias/paletas';
import { usePrivacidade } from '../../privacidade/usePrivacidade';

function Campo({ rotulo, descricao, children }: { rotulo: string; descricao?: string; children: ReactNode }) {
  return (
    <div>
      <Text size="sm" fw={500}>
        {rotulo}
      </Text>
      {descricao && (
        <Text size="xs" c="dimmed" mb={6}>
          {descricao}
        </Text>
      )}
      {!descricao && <div style={{ height: 6 }} />}
      {children}
    </div>
  );
}

export function SecaoAparencia() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { preferencias, atualizar, restaurar } = usePreferenciasDispositivo();
  const [ocultos, alternarPrivacidade] = usePrivacidade();

  return (
    <Card withBorder padding="lg">
      <Title order={4}>Aparência</Title>
      <Text size="sm" c="dimmed" mb="md">
        Vale só para este aparelho. Em outro navegador você pode escolher diferente.
      </Text>

      <Stack gap="lg">
        <Campo rotulo="Tema">
          <SegmentedControl
            fullWidth
            value={colorScheme}
            onChange={(valor) => setColorScheme(valor as 'light' | 'dark' | 'auto')}
            data={[
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
              { value: 'auto', label: 'Automático' },
            ]}
          />
        </Campo>

        <Campo rotulo="Estilo do modo escuro" descricao="Aparece quando o tema escuro está ativo.">
          <SegmentedControl
            fullWidth
            value={preferencias.estiloEscuro}
            onChange={(valor) => atualizar({ estiloEscuro: valor as EstiloEscuro })}
            data={[
              { value: 'azul', label: 'Azul-noite' },
              { value: 'preto', label: 'Preto' },
              { value: 'grafite', label: 'Grafite' },
            ]}
          />
        </Campo>

        <Campo rotulo="Cantos">
          <SegmentedControl
            fullWidth
            value={preferencias.cantos}
            onChange={(valor) => atualizar({ cantos: valor as Cantos })}
            data={[
              { value: 'xs', label: 'Retos' },
              { value: 'md', label: 'Médios' },
              { value: 'xl', label: 'Arredondados' },
            ]}
          />
        </Campo>

        <Campo rotulo="Tamanho do texto">
          <SegmentedControl
            fullWidth
            value={preferencias.tamanhoTexto}
            onChange={(valor) => atualizar({ tamanhoTexto: valor as TamanhoTexto })}
            data={[
              { value: 'pequeno', label: 'Pequeno' },
              { value: 'normal', label: 'Normal' },
              { value: 'grande', label: 'Grande' },
            ]}
          />
        </Campo>

        <Switch
          checked={ocultos}
          onChange={alternarPrivacidade}
          label="Ocultar valores em reais"
          description="Troca os valores por R$ ••••• em todas as telas. Também dá para alternar pelo ícone de olho no topo."
        />

        <Switch
          checked={preferencias.animacoes}
          onChange={(evento) => atualizar({ animacoes: evento.currentTarget.checked })}
          label="Animações e transições"
          description="Desative se preferir telas sem movimento."
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={restaurar}>
            Restaurar padrões deste aparelho
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}