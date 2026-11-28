import { Group, SimpleGrid, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { buscarPainel } from '../../api/painel';
import { CartaoResumo } from '../../componentes/CartaoResumo';
import { ErroDeCarga } from '../../componentes/Estados';
import { mesAtual, moeda } from '../../utils/formatar';
import { AcoesRapidas } from './AcoesRapidas';
import { GastosDoMes } from './GastosDoMes';
import { HabitosDeHoje } from './HabitosDeHoje';
import { RecompensasLiberadas } from './RecompensasLiberadas';
import { ReservaEFundo } from './ReservaEFundo';
import { Saudacao } from './Saudacao';
import { EsqueletoPainel } from './EsqueletoPainel';
import { PrimeirosPassos } from './PrimeirosPassos';

/** Faz o cartão inteiro virar um atalho para outra tela. */
function Atalho({ para, children }: { para: string; children: ReactNode }) {
  return (
    <Link
      to={para}
      style={{ display: 'block', height: '100%', color: 'inherit', textDecoration: 'none' }}
    >
      {children}
    </Link>
  );
}

export function PainelPage() {
  const mes = mesAtual();
  const painel = useQuery({ queryKey: ['painel', mes], queryFn: () => buscarPainel(mes) });

  if (painel.isPending) return <EsqueletoPainel />;
  if (painel.isError) return <ErroDeCarga erro={painel.error} aoTentar={() => painel.refetch()} />;

  const dados = painel.data;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" gap="md">
        <Saudacao />
        <AcoesRapidas />
      </Group>
      <PrimeirosPassos dados={dados} />

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <Atalho para="/habitos">
          <CartaoResumo
            titulo="Hábitos"
            valor={`${dados.habitos.percentual}%`}
            progresso={dados.habitos.percentual}
            detalhe={`${dados.habitos.diasRealizados} de ${dados.habitos.metaTotalDias} dias da meta`}
          />
        </Atalho>
        <Atalho para="/bingo">
          <CartaoResumo
            titulo="Bingo"
            valor={`${dados.bingo.celulasConcluidas}/25`}
            progresso={(dados.bingo.celulasConcluidas / 25) * 100}
            detalhe={
              dados.bingo.celulasDefinidas === 0
                ? 'Crie os desafios do mês'
                : `Linhas completas: ${dados.bingo.linhas}`
            }
          />
        </Atalho>
                <Atalho para="/bingo">
          <CartaoResumo
            titulo="Pontos"
            valor={String(dados.saldoPontos)}
            corDoValor={dados.saldoPontos < 0 ? 'red' : undefined}
            detalhe={`${dados.bingo.pontosDoMes} pts no mês · ${dados.recompensasDisponiveis.length} liberada(s)`}
            reservarBarra
          />
        </Atalho>
        <Atalho para="/financas">
          <CartaoResumo
            titulo="Saldo disponível"
            valor={moeda(dados.financas.saldoDisponivel)}
            corDoValor={dados.financas.saldoDisponivel < 0 ? 'red' : undefined}
            detalhe={`Livre após as metas: ${moeda(dados.financas.saldoAposMetas)}`}
            reservarBarra
          />
        </Atalho>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <HabitosDeHoje />
        <GastosDoMes categorias={dados.financas.categorias} totalDespesas={dados.financas.totalDespesas} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <RecompensasLiberadas itens={dados.recompensasDisponiveis} saldoPontos={dados.saldoPontos} />
        <ReservaEFundo financas={dados.financas} />
      </SimpleGrid>
    </Stack>
  );
}