const FRASES = [
  'Pequenos passos, todos os dias, levam longe.',
  'Constância vale mais que perfeição.',
  'Hoje é um bom dia para cuidar do seu eu de amanhã.',
  'Cada hábito cumprido é um passo na direção do que você quer.',
  'Organizar o dinheiro é cuidar da sua liberdade.',
  'Não precisa ser perfeito: basta continuar.',
  'Uma recompensa merecida tem outro sabor.',
  'Comece pelo que está ao seu alcance hoje.',
  'O progresso aparece quando você insiste.',
  'Planejar o mês é o primeiro passo para aproveitar o mês.',
  'Em dia difícil, faça o mínimo e siga em frente.',
  'O seu futuro agradece cada real guardado.',
  'Celebre as pequenas vitórias.',
  'Recomeçar também faz parte do caminho.',
];

export function saudacaoDoHorario(agora: Date = new Date()): string {
  const hora = agora.getHours();
  if (hora < 5) return 'Boa madrugada';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** A frase muda uma vez por dia (e se repete a cada 14 dias). */
export function fraseDoDia(agora: Date = new Date()): string {
  const inicioDoAno = new Date(agora.getFullYear(), 0, 0);
  const diaDoAno = Math.floor((agora.getTime() - inicioDoAno.getTime()) / 86_400_000);
  return FRASES[diaDoAno % FRASES.length];
}