import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function AlternarTema() {
  const { setColorScheme } = useMantineColorScheme();
  const tema = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Alternar tema claro ou escuro"
      onClick={() => setColorScheme(tema === 'light' ? 'dark' : 'light')}
    >
      {tema === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
    </ActionIcon>
  );
}