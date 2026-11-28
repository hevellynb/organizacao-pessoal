import { valoresOcultos } from '../privacidade/armazenamento';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function moeda(valor: number): string {
  return valoresOcultos() ? 'R$ •••••' : formatadorMoeda.format(valor);
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// ---------- datas como texto "AAAA-MM-DD" (sem o problema de fuso horário) ----------

function formatarISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function lerISO(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO(): string {
  return formatarISO(new Date());
}

export function somarDias(iso: string, quantidade: number): string {
  const data = lerISO(iso);
  data.setDate(data.getDate() + quantidade);
  return formatarISO(data);
}

/** Devolve o dia 1 do mês, 'quantidade' meses à frente (ou atrás, se negativa). */
export function somarMeses(iso: string, quantidade: number): string {
  const data = lerISO(iso);
  return formatarISO(new Date(data.getFullYear(), data.getMonth() + quantidade, 1));
}

/** De "2026-11-23" para "2026-11". */
export function mesDe(iso: string): string {
  return iso.slice(0, 7);
}

export function mesAtual(): string {
  return mesDe(hojeISO());
}

export function nomeDoMes(mes: string): string {
  const [ano, numero] = mes.split('-').map(Number);
  const texto = new Date(ano, numero - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return capitalizar(texto);
}

export function dataPorExtenso(iso: string): string {
  const texto = lerISO(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return capitalizar(texto);
}

/** "2026-11" vira "2026-11-30" (o último dia do mês). */
export function ultimoDiaDoMes(mes: string): string {
  const [ano, numero] = mes.split('-').map(Number);
  return formatarISO(new Date(ano, numero, 0));
}

/** "2026-11-23" vira "23/11/2026". */
export function dataCurta(iso: string): string {
  return iso.split('-').reverse().join('/');
}

/** "2026-11-26T14:30:00-03:00" vira "26/11/2026". */
export function dataDoTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}