import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Menu,
  NavLink,
  Title,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChecklist,
  IconGift,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogout,
  IconSettings,
  IconWallet,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { AlternarTema } from '../componentes/AlternarTema';
import { Logo } from '../componentes/Logo';
import classes from './Layout.module.css';

const itensDoMenu = [
  { rota: '/', rotulo: 'Painel', Icone: IconLayoutDashboard },
  { rota: '/habitos', rotulo: 'Hábitos', Icone: IconChecklist },
  { rota: '/bingo', rotulo: 'Bingo', Icone: IconLayoutGrid },
  { rota: '/financas', rotulo: 'Finanças', Icone: IconWallet },
  { rota: '/recompensas', rotulo: 'Recompensas', Icone: IconGift },
  { rota: '/configuracoes', rotulo: 'Configurações', Icone: IconSettings },
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
  const navigate = useNavigate();
  const tema = useMantineTheme();
  const { usuario, sair } = useAuth();

  const exibicao = usuario?.apelido || usuario?.nome || '';

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
            <Group gap="xs" wrap="nowrap">
              <Logo tamanho={30} />
              <Title order={4}>Organização Pessoal</Title>
            </Group>
          </Group>

          <Group gap="sm">
            <AlternarTema />
            <Menu position="bottom-end" width={230}>
              <Menu.Target>
                <UnstyledButton aria-label="Menu do usuário">
                  <Avatar color={tema.primaryColor} radius="xl">
                    {iniciais(exibicao)}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{exibicao}</Menu.Label>
                <Menu.Label>{usuario?.email}</Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={() => {
                    navigate('/configuracoes');
                    close();
                  }}
                >
                  Configurações
                </Menu.Item>
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
        {/* a "key" recria o bloco a cada rota, e isso reinicia a animação de entrada */}
        <div key={pathname} className={classes.pagina}>
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}