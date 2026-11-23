import { Route, Routes } from 'react-router';
import { AppLayout } from './layout/AppLayout';
import { PainelPage } from './paginas/PainelPage';
import { PaginaEmBreve } from './paginas/PaginaEmBreve';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<PainelPage />} />
        <Route path="habitos" element={<PaginaEmBreve titulo="Hábitos" />} />
        <Route path="bingo" element={<PaginaEmBreve titulo="Bingo" />} />
        <Route path="financas" element={<PaginaEmBreve titulo="Finanças" />} />
        <Route path="recompensas" element={<PaginaEmBreve titulo="Recompensas" />} />
      </Route>
    </Routes>
  );
}