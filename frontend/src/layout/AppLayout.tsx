import { Avatar, AppShell, Burger, Group, Menu, NavLink, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChecklist,
  IconGift,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogout,
  IconWallet,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { AlternarTema } from '../componentes/AlternarTema';

const itensDoMenu = [
  { rota: '/', rotulo: 'Painel', Icone: IconLayoutDashboard },
  { rota: '/habitos', rotulo: 'Hábitos', Icone: IconChecklist },
  { rota: '/bingo', rotulo: 'Bingo', Icone: IconLayoutGrid },
  { rota: '/financas', rotulo: 'Finanças', Icone: IconWallet },
  { rota: '/recompensas', rotulo: 'Recompensas', Icone: IconGift },
];

function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}

export function AppLayout() {
  const [menuAberto, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();
  const { usuario, sair } = useAuth();

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

          <Group gap="sm">
            <AlternarTema />
            <Menu position="bottom-end" width={220}>
              <Menu.Target>
                <UnstyledButton aria-label="Menu do usuário">
                  <Avatar color="violet" radius="xl">
                    {iniciais(usuario?.nome ?? '')}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{usuario?.nome}</Menu.Label>
                <Menu.Label>{usuario?.email}</Menu.Label>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={16} />} onClick={sair}>
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
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