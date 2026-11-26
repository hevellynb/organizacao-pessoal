import { Navigate, Route, Routes } from 'react-router';
import { RotaProtegida } from './auth/RotaProtegida';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './paginas/LoginPage';
import { PainelPage } from './paginas/PainelPage';
import { HabitosPage } from './paginas/habitos/HabitosPage';
import { FinancasPage } from './paginas/financas/FinancasPage';
import { BingoPage } from './paginas/bingo/BingoPage';
import { RecompensasPage } from './paginas/recompensas/RecompensasPage';

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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}