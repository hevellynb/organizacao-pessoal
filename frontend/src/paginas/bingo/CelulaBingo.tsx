import { ActionIcon, Box, Progress, Tooltip, UnstyledButton } from '@mantine/core';
import {
  IconCheck,
  IconChecklist,
  IconCircleCheck,
  IconCoin,
  IconPlus,
  IconTarget,
} from '@tabler/icons-react';
import type { CelulaCartela } from '../../api/bingo';
import { moeda } from '../../utils/formatar';
import classes from './Bingo.module.css';

const ICONES = {
  HABITO: IconChecklist,
  FINANCEIRA: IconCoin,
  MANUAL: IconTarget,
} as const;

function juntar(...nomes: (string | false | undefined)[]): string {
  return nomes.filter(Boolean).join(' ');
}

function detalhe(celula: CelulaCartela): string {
  if (celula.tipo === 'HABITO') {
    return `${celula.titulo}: ${celula.atual ?? 0} de ${celula.meta ?? 0} dias no mês.`;
  }
  if (celula.tipo === 'FINANCEIRA') {
    const valores = `${moeda(celula.atual ?? 0)} de ${moeda(celula.meta ?? 0)}`;
    return celula.regra === 'LIMITE_GASTO'
      ? `${celula.titulo}: gasto de ${valores}. Vale se ficar dentro do limite quando o mês terminar.`
      : `${celula.titulo}: aportado ${valores}.`;
  }
  return `${celula.titulo}: ${celula.concluida ? 'concluído' : 'marque quando concluir'}.`;
}

interface CelulaBingoProps {
  celula: CelulaCartela;
  naLinha: boolean; // faz parte de uma linha, coluna ou diagonal completa
  somenteLeitura: boolean;
  alternando: boolean;
  aoAbrir: () => void;
  aoAlternar: (concluida: boolean) => void;
}

export function CelulaBingo({
  celula,
  naLinha,
  somenteLeitura,
  alternando,
  aoAbrir,
  aoAlternar,
}: CelulaBingoProps) {
  if (!celula.definida) {
    return (
      <UnstyledButton
        className={juntar(classes.celula, classes.vazia)}
        onClick={aoAbrir}
        disabled={somenteLeitura}
        aria-label={`Adicionar desafio na posição ${celula.posicao + 1}`}
      >
        {!somenteLeitura && <IconPlus size={18} />}
      </UnstyledButton>
    );
  }

  const Icone = celula.tipo ? ICONES[celula.tipo] : IconTarget;
  const manual = celula.tipo === 'MANUAL';
  const mostrarBarra = celula.tipo === 'HABITO' || celula.tipo === 'FINANCEIRA';

  const meta = celula.meta ?? 0;
  const atual = celula.atual ?? 0;
  const percentual = meta > 0 ? Math.min(100, (atual / meta) * 100) : 0;
  const estourou = celula.regra === 'LIMITE_GASTO' && atual > meta;
  const cor = celula.concluida
    ? 'teal'
    : estourou
      ? 'red'
      : 'var(--mantine-primary-color-filled)';

  return (
    <Tooltip label={detalhe(celula)} multiline w={220} withArrow openDelay={300}>
      <Box pos="relative">
        <UnstyledButton
          className={juntar(classes.celula, celula.concluida && classes.concluida, naLinha && classes.linha)}
          onClick={aoAbrir}
          disabled={somenteLeitura}
          aria-label={`${celula.titulo}. ${celula.concluida ? 'Concluído' : 'Pendente'}. Editar desafio.`}
        >
          <Icone size={14} className={classes.icone} />
          <span className={classes.titulo}>{celula.titulo}</span>
          {mostrarBarra ? <Progress value={percentual} size={4} radius="xl" color={cor} /> : <span />}
        </UnstyledButton>

        {manual ? (
          <ActionIcon
            className={classes.marca}
            size="sm"
            radius="xl"
            color="teal"
            variant={celula.concluida ? 'filled' : 'default'}
            disabled={somenteLeitura || alternando}
            onClick={() => aoAlternar(!celula.concluida)}
            aria-label={celula.concluida ? 'Desmarcar desafio' : 'Marcar desafio como concluído'}
          >
            <IconCheck size={14} />
          </ActionIcon>
        ) : celula.concluida ? (
          <IconCircleCheck
            className={classes.marca}
            size={18}
            color="var(--mantine-color-teal-filled)"
            aria-hidden
          />
        ) : null}
      </Box>
    </Tooltip>
  );
}