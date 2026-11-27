import { Navigate, Route, Routes } from 'react-router';
import { RotaProtegida } from './auth/RotaProtegida';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './paginas/LoginPage';
import { HabitosPage } from './paginas/habitos/HabitosPage';
import { FinancasPage } from './paginas/financas/FinancasPage';
import { BingoPage } from './paginas/bingo/BingoPage';
import { RecompensasPage } from './paginas/recompensas/RecompensasPage';
import { ConfiguracoesPage } from './paginas/configuracoes/ConfiguracoesPage';
import { PainelPage } from './paginas/painel/PainelPage';

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />

      <Route element={<RotaProtegida />}>
        <Route element={<AppLayout />}>
          <Route index element={<PainelPage />} />
          <Route path="habitos" element={<HabitosPage />} />
          <Route path="bingo" element={<BingoPage />} />
          <Route path="financas" element={<FinancasPage />} />
          <Route path="recompensas" element={<RecompensasPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}