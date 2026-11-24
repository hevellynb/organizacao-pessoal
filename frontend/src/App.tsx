import { Navigate, Route, Routes } from 'react-router';
import { RotaProtegida } from './auth/RotaProtegida';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './paginas/LoginPage';
import { PainelPage } from './paginas/PainelPage';
import { PaginaEmBreve } from './paginas/PaginaEmBreve';

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />

      <Route element={<RotaProtegida />}>
        <Route element={<AppLayout />}>
          <Route index element={<PainelPage />} />
          <Route path="habitos" element={<PaginaEmBreve titulo="Hábitos" />} />
          <Route path="bingo" element={<PaginaEmBreve titulo="Bingo" />} />
          <Route path="financas" element={<PaginaEmBreve titulo="Finanças" />} />
          <Route path="recompensas" element={<PaginaEmBreve titulo="Recompensas" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}