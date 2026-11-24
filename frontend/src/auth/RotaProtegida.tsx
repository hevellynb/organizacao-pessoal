import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';

export function RotaProtegida() {
  const { usuario, carregando } = useAuth();
  const local = useLocation();

  if (carregando) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ de: local.pathname }} />;
  }
  return <Outlet />;
}