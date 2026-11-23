import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChecklist,
  IconGift,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconWallet,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router';
import { AlternarTema } from '../componentes/AlternarTema';

const itensDoMenu = [
  { rota: '/', rotulo: 'Painel', Icone: IconLayoutDashboard },
  { rota: '/habitos', rotulo: 'Hábitos', Icone: IconChecklist },
  { rota: '/bingo', rotulo: 'Bingo', Icone: IconLayoutGrid },
  { rota: '/financas', rotulo: 'Finanças', Icone: IconWallet },
  { rota: '/recompensas', rotulo: 'Recompensas', Icone: IconGift },
];

export function AppLayout() {
  const [menuAberto, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !menuAberto } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={menuAberto} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Organização Pessoal</Title>
          </Group>
          <AlternarTema />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {itensDoMenu.map(({ rota, rotulo, Icone }) => (
          <NavLink
            key={rota}
            component={Link}
            to={rota}
            label={rotulo}
            leftSection={<Icone size={20} stroke={1.6} />}
            active={pathname === rota}
            variant="light"
            onClick={close}
            mb={4}
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}