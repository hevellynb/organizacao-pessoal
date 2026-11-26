import { Alert, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconInfoCircle, IconTrophy } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { buscarCartela, concluirCelulaManual } from '../../api/bingo';
import { CartaoResumo } from '../../componentes/CartaoResumo';
import { Carregando, ErroDeCarga } from '../../componentes/Estados';
import { useAposAlterarBingo } from '../../hooks/useAposAlterarBingo';
import { avisarErro } from '../../utils/avisos';
import { mesAtual } from '../../utils/formatar';
import classes from './Bingo.module.css';
import { CelulaBingo } from './CelulaBingo';
import { FormularioCelula } from './FormularioCelula';

export function CartelaBingo({ mes }: { mes: string }) {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const aposAlterar = useAposAlterarBingo(mes);

  const cartela = useQuery({
    queryKey: ['bingo', mes],
    queryFn: () => buscarCartela(mes),
  });

  const alternar = useMutation({
    mutationFn: (dados: { posicao: number; concluida: boolean }) =>
      concluirCelulaManual(mes, dados.posicao, dados.concluida),
    onSuccess: aposAlterar,
    onError: (erro) => avisarErro(erro, 'Não foi possível atualizar o desafio'),
  });

  if (cartela.isPending) return <Carregando />;
  if (cartela.isError) return <ErroDeCarga erro={cartela.error} aoTentar={() => cartela.refetch()} />;

  const dados = cartela.data;
  const somenteLeitura = mes < mesAtual() || dados.fechada;
  const previa = dados.id === null && mes > mesAtual(); // mês futuro ainda não gravado
  const naLinha = new Set(dados.linhasCompletas.flat());
  const concluidas = dados.celulas.filter((c) => c.definida && c.concluida).length;

  return (
    <Stack gap="md">
      {dados.cartelaCompleta && (
        <Alert color="teal" icon={<IconTrophy />} title="Cartela completa!">
          Você completou todas as 25 células e ganhou o bônus da cartela.
        </Alert>
      )}
      {somenteLeitura && (
        <Alert color="gray" icon={<IconInfoCircle />}>
          Este mês já terminou: a cartela está congelada e não pode mais ser alterada.
        </Alert>
      )}
      {previa && (
        <Alert color="blue" icon={<IconInfoCircle />} title="Prévia do mês">
          Estas metas vieram do mês anterior. Ao alterar qualquer célula, a cartela deste mês passa a
          existir. Os desafios manuais recomeçam desmarcados.
        </Alert>
      )}

      <div className={classes.layout}>
        <div className={classes.areaGrade}>
          <SimpleGrid cols={5} spacing={{ base: 6, sm: 'xs' }}>
            {dados.celulas.map((celula) => (
              <CelulaBingo
                key={celula.posicao}
                celula={celula}
                naLinha={naLinha.has(celula.posicao)}
                somenteLeitura={somenteLeitura}
                alternando={alternar.isPending}
                aoAbrir={() => setSelecionada(celula.posicao)}
                aoAlternar={(concluida) => alternar.mutate({ posicao: celula.posicao, concluida })}
              />
            ))}
          </SimpleGrid>
          <Text size="xs" c="dimmed" mt="xs">
            As metas continuam nos meses seguintes: edite ou limpe o que mudar. O contorno colorido
            marca as linhas, colunas e diagonais completas.
          </Text>
        </div>

        <div className={classes.areaResumo}>
          <SimpleGrid cols={{ base: 2, md: 1 }}>
            <CartaoResumo
              titulo="Pontos do mês"
              valor={String(dados.pontosDoMes)}
              detalhe="Linhas e bônus da cartela"
            />
            <CartaoResumo
              titulo="Saldo de pontos"
              valor={String(dados.saldoPontos)}
              corDoValor={dados.saldoPontos < 0 ? 'red' : undefined}
              detalhe="Disponível para recompensas"
            />
            <CartaoResumo
              titulo="Linhas completas"
              valor={String(dados.quantidadeLinhas)}
              detalhe="Linhas, colunas e diagonais"
            />
            <CartaoResumo
              titulo="Células concluídas"
              valor={`${concluidas}/25`}
              progresso={(concluidas / 25) * 100}
            />
          </SimpleGrid>
        </div>
      </div>

      <FormularioCelula
        mes={mes}
        posicao={selecionada}
        celula={selecionada === null ? null : dados.celulas[selecionada]}
        aoFechar={() => setSelecionada(null)}
      />
    </Stack>
  );
}