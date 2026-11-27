import { Text, Title } from '@mantine/core';
import { useAuth } from '../../auth/useAuth';
import { dataPorExtenso, hojeISO } from '../../utils/formatar';
import { fraseDoDia, saudacaoDoHorario } from '../../utils/saudacao';

export function Saudacao() {
  const { usuario } = useAuth();
  const nome = usuario?.apelido || usuario?.nome.split(' ')[0] || '';

  return (
    <div>
      <Title order={2}>
        {saudacaoDoHorario()}, {nome}!
      </Title>
      <Text c="dimmed">{dataPorExtenso(hojeISO())}</Text>
      <Text size="sm" fs="italic" mt={4}>
        {fraseDoDia()}
      </Text>
    </div>
  );
}