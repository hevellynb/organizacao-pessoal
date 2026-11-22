package com.organizacao.bingo;

import com.organizacao.bingo.BingoDtos.*;
import com.organizacao.erro.RecursoNaoEncontradoException;
import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.CategoriaOrcamento;
import com.organizacao.financas.CategoriaRepository;
import com.organizacao.financas.DespesaRepository;
import com.organizacao.financas.DespesaRepository.TotalCategoria;
import com.organizacao.financas.TipoCategoria;
import com.organizacao.habito.HabitoRepository;
import com.organizacao.habito.RegistroHabito;
import com.organizacao.habito.RegistroHabitoRepository;
import com.organizacao.pontos.LancamentoPontos;
import com.organizacao.pontos.LancamentoPontosRepository;
import com.organizacao.pontos.TipoLancamento;
import com.organizacao.usuario.RegraPontuacao;
import com.organizacao.usuario.RegraPontuacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BingoService {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final int TAMANHO = 25;

    // 5 linhas, 5 colunas e 2 diagonais (posições da grade 5x5)
    private static final int[][] LINHAS = {
            {0, 1, 2, 3, 4}, {5, 6, 7, 8, 9}, {10, 11, 12, 13, 14}, {15, 16, 17, 18, 19}, {20, 21, 22, 23, 24},
            {0, 5, 10, 15, 20}, {1, 6, 11, 16, 21}, {2, 7, 12, 17, 22}, {3, 8, 13, 18, 23}, {4, 9, 14, 19, 24},
            {0, 6, 12, 18, 24}, {4, 8, 12, 16, 20}};

    private record Avaliacao(boolean concluida, BigDecimal atual, BigDecimal meta,
                             String unidade, String regra) {
        static final Avaliacao VAZIA = new Avaliacao(false, null, null, null, null);
    }

    private record Placar(List<List<Integer>> linhas, boolean cheia) { }

    private final CartelaRepository cartelas;
    private final CelulaRepository celulas;
    private final HabitoRepository habitos;
    private final RegistroHabitoRepository registros;
    private final CategoriaRepository categorias;
    private final DespesaRepository despesas;
    private final RegraPontuacaoRepository regras;
    private final LancamentoPontosRepository lancamentos;

    public BingoService(CartelaRepository cartelas, CelulaRepository celulas,
                        HabitoRepository habitos, RegistroHabitoRepository registros,
                        CategoriaRepository categorias, DespesaRepository despesas,
                        RegraPontuacaoRepository regras, LancamentoPontosRepository lancamentos) {
        this.cartelas = cartelas;
        this.celulas = celulas;
        this.habitos = habitos;
        this.registros = registros;
        this.categorias = categorias;
        this.despesas = despesas;
        this.regras = regras;
        this.lancamentos = lancamentos;
    }

    // ==================== parte pública ====================

    @Transactional
    public CartelaResposta obter(UUID usuarioId, YearMonth mes) {
        sincronizar(usuarioId);
        return montar(usuarioId, mes);
    }

    @Transactional
    public CartelaResposta definirCelula(UUID usuarioId, YearMonth mes, int posicao, CelulaRequest r) {
        validarPosicao(posicao);
        Cartela cartela = cartelaEditavel(usuarioId, mes);
        validarVinculos(usuarioId, r);
        Celula celula = celulas.findByCartelaIdAndPosicao(cartela.getId(), (short) posicao)
                .orElseGet(() -> new Celula(cartela.getId(), (short) posicao));
        celula.definir(r.titulo().trim(), r.tipo(),
                r.tipo() == TipoCelula.HABITO ? r.habitoId() : null,
                r.tipo() == TipoCelula.HABITO ? r.metaDias() : null,
                r.tipo() == TipoCelula.FINANCEIRA ? r.categoriaId() : null);
        celulas.save(celula);
        sincronizar(usuarioId);
        return montar(usuarioId, mes);
    }

    @Transactional
    public CartelaResposta limparCelula(UUID usuarioId, YearMonth mes, int posicao) {
        validarPosicao(posicao);
        Cartela cartela = cartelaEditavel(usuarioId, mes);
        celulas.findByCartelaIdAndPosicao(cartela.getId(), (short) posicao).ifPresent(celulas::delete);
        sincronizar(usuarioId);
        return montar(usuarioId, mes);
    }

    @Transactional
    public CartelaResposta concluirManual(UUID usuarioId, YearMonth mes, int posicao, boolean concluida) {
        validarPosicao(posicao);
        Cartela cartela = cartelaEditavel(usuarioId, mes);
        Celula c = celulas.findByCartelaIdAndPosicao(cartela.getId(), (short) posicao)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Célula não encontrada."));
        if (c.getTipo() != TipoCelula.MANUAL) {
            throw new RegraDeNegocioException(
                    "Só desafios manuais são marcados à mão. Os demais são atualizados automaticamente.");
        }
        c.setConcluidaManual(concluida);
        sincronizar(usuarioId);
        return montar(usuarioId, mes);
    }

    @Transactional
    public PontosResposta extrato(UUID usuarioId) {
        sincronizar(usuarioId);
        List<LancamentoResposta> lista = lancamentos.findTop50ByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .stream()
                .map(l -> new LancamentoResposta(l.getId(), l.getTipo(), l.getPontos(),
                        l.getDescricao(), l.getCriadoEm()))
                .toList();
        return new PontosResposta(saldoPontos(usuarioId), lista);
    }

    /** Usado pelo módulo de recompensas: saldo já sincronizado. */
    @Transactional
    public int saldo(UUID usuarioId) {
        sincronizar(usuarioId);
        return saldoPontos(usuarioId);
    }

    @Transactional(readOnly = true)
    public RegrasResposta regras(UUID usuarioId) {
        RegraPontuacao r = regraDe(usuarioId);
        return new RegrasResposta(r.getPontosPorLinha(), r.getBonusCartela());
    }

    @Transactional
    public RegrasResposta atualizarRegras(UUID usuarioId, RegrasRequest req) {
        RegraPontuacao r = regraDe(usuarioId);
        r.atualizar(req.pontosPorLinha(), req.bonusCartela());
        sincronizar(usuarioId); // recalcula as cartelas abertas com as novas regras
        return new RegrasResposta(r.getPontosPorLinha(), r.getBonusCartela());
    }

    // ==================== sincronização de pontos ====================

    private void sincronizar(UUID usuarioId) {
        RegraPontuacao regra = regraDe(usuarioId);
        YearMonth atual = YearMonth.now(ZONA);
        for (Cartela c : cartelas.findByUsuarioIdAndFechadaFalse(usuarioId)) {
            YearMonth mes = YearMonth.from(c.getMes());
            Placar p = placar(avaliarGrade(usuarioId, mes, grade(c.getId())));
            int alvo = p.linhas().size() * regra.getPontosPorLinha()
                    + (p.cheia() ? regra.getBonusCartela() : 0);
            int jaLancado = valor(lancamentos.somaPorCartela(
                    usuarioId, c.getId(), TipoLancamento.GANHO_BINGO));
            int delta = alvo - jaLancado;
            if (delta != 0) {
                lancamentos.save(new LancamentoPontos(usuarioId, TipoLancamento.GANHO_BINGO,
                        delta, c.getId(), "Bingo de " + mes));
            }
            if (mes.isBefore(atual)) {
                c.fechar(); // mês encerrado: pontos congelados
            }
        }
    }

    // ==================== avaliação das células ====================

    private Avaliacao[] avaliarGrade(UUID usuarioId, YearMonth mes, Celula[] grade) {
        LocalDate ini = mes.atDay(1);
        LocalDate fim = mes.atEndOfMonth();

        Set<UUID> habitoIds = new HashSet<>();
        for (Celula c : grade) {
            if (c != null && c.getTipo() == TipoCelula.HABITO && c.getHabitoId() != null) {
                habitoIds.add(c.getHabitoId());
            }
        }
        Map<UUID, Long> dias = habitoIds.isEmpty() ? Map.of()
                : registros.findByHabitoIdInAndDataBetween(habitoIds, ini, fim).stream()
                .collect(Collectors.groupingBy(RegistroHabito::getHabitoId, Collectors.counting()));

        Map<UUID, BigDecimal> gastos = despesas.totaisPorCategoria(usuarioId, ini, fim).stream()
                .collect(Collectors.toMap(TotalCategoria::getCategoriaId, TotalCategoria::getTotal));
        Map<UUID, CategoriaOrcamento> cats = categorias
                .findByUsuarioIdOrderByOrdemAscNomeAsc(usuarioId).stream()
                .collect(Collectors.toMap(CategoriaOrcamento::getId, c -> c));
        boolean encerrado = mes.isBefore(YearMonth.now(ZONA));

        Avaliacao[] resultado = new Avaliacao[TAMANHO];
        for (int i = 0; i < TAMANHO; i++) {
            resultado[i] = grade[i] == null ? Avaliacao.VAZIA
                    : avaliar(grade[i], dias, gastos, cats, encerrado);
        }
        return resultado;
    }

    private Avaliacao avaliar(Celula c, Map<UUID, Long> dias, Map<UUID, BigDecimal> gastos,
                              Map<UUID, CategoriaOrcamento> cats, boolean encerrado) {
        return switch (c.getTipo()) {
            case HABITO -> {
                long feitos = c.getHabitoId() == null ? 0 : dias.getOrDefault(c.getHabitoId(), 0L);
                int meta = c.getMetaDias() == null ? 0 : c.getMetaDias();
                yield new Avaliacao(c.getHabitoId() != null && meta > 0 && feitos >= meta,
                        BigDecimal.valueOf(feitos), BigDecimal.valueOf(meta), "DIAS", null);
            }
            case FINANCEIRA -> {
                CategoriaOrcamento cat = c.getCategoriaId() == null ? null : cats.get(c.getCategoriaId());
                if (cat == null) {
                    yield new Avaliacao(false, ZERO, ZERO, "REAIS", null);
                }
                BigDecimal gasto = gastos.getOrDefault(cat.getId(), ZERO);
                BigDecimal orcamento = cat.getOrcamentoMensal();
                if (cat.getTipo() == TipoCategoria.ECONOMIA) {
                    yield new Avaliacao(orcamento.signum() > 0 && gasto.compareTo(orcamento) >= 0,
                            gasto, orcamento, "REAIS", "META_ECONOMIA");
                }
                yield new Avaliacao(encerrado && gasto.compareTo(orcamento) <= 0,
                        gasto, orcamento, "REAIS", "LIMITE_GASTO");
            }
            case MANUAL -> new Avaliacao(c.isConcluidaManual(), null, null, null, null);
        };
    }

    private Placar placar(Avaliacao[] av) {
        List<List<Integer>> completas = new ArrayList<>();
        for (int[] linha : LINHAS) {
            if (Arrays.stream(linha).allMatch(i -> av[i].concluida())) {
                completas.add(Arrays.stream(linha).boxed().toList());
            }
        }
        boolean cheia = Arrays.stream(av).allMatch(Avaliacao::concluida);
        return new Placar(completas, cheia);
    }

    // ==================== montagem da resposta ====================

    private CartelaResposta montar(UUID usuarioId, YearMonth mes) {
        int saldo = saldoPontos(usuarioId);
        Optional<Cartela> opt = cartelas.findByUsuarioIdAndMes(usuarioId, mes.atDay(1));
        if (opt.isEmpty()) {
            List<CelulaResposta> vazias = new ArrayList<>();
            for (int i = 0; i < TAMANHO; i++) vazias.add(CelulaResposta.vazia(i));
            return new CartelaResposta(null, mes.toString(), false, vazias, List.of(), 0, false, 0, saldo);
        }
        Cartela cartela = opt.get();
        Celula[] grade = grade(cartela.getId());
        Avaliacao[] av = avaliarGrade(usuarioId, mes, grade);
        Placar p = placar(av);

        List<CelulaResposta> lista = new ArrayList<>();
        for (int i = 0; i < TAMANHO; i++) {
            Celula c = grade[i];
            if (c == null) {
                lista.add(CelulaResposta.vazia(i));
            } else {
                Avaliacao a = av[i];
                lista.add(new CelulaResposta(i, true, c.getTitulo(), c.getTipo(), c.getHabitoId(),
                        c.getMetaDias(), c.getCategoriaId(), a.concluida(), a.atual(), a.meta(),
                        a.unidade(), a.regra()));
            }
        }
        int pontosDoMes = valor(lancamentos.somaPorCartela(
                usuarioId, cartela.getId(), TipoLancamento.GANHO_BINGO));
        return new CartelaResposta(cartela.getId(), mes.toString(), cartela.isFechada(), lista,
                p.linhas(), p.linhas().size(), p.cheia(), pontosDoMes, saldo);
    }

    // ==================== apoio ====================

    private Celula[] grade(UUID cartelaId) {
        Celula[] g = new Celula[TAMANHO];
        for (Celula c : celulas.findByCartelaId(cartelaId)) {
            g[c.getPosicao()] = c;
        }
        return g;
    }

    private Cartela cartelaEditavel(UUID usuarioId, YearMonth mes) {
        if (mes.isBefore(YearMonth.now(ZONA))) {
            throw new RegraDeNegocioException("Cartelas de meses encerrados não podem ser alteradas.");
        }
        return cartelas.findByUsuarioIdAndMes(usuarioId, mes.atDay(1))
                .orElseGet(() -> cartelas.save(new Cartela(usuarioId, mes.atDay(1))));
    }

    private void validarPosicao(int posicao) {
        if (posicao < 0 || posicao >= TAMANHO) {
            throw new RegraDeNegocioException("Posição inválida. Use de 0 a 24.");
        }
    }

    private void validarVinculos(UUID usuarioId, CelulaRequest r) {
        switch (r.tipo()) {
            case HABITO -> {
                if (r.habitoId() == null || r.metaDias() == null) {
                    throw new RegraDeNegocioException(
                            "Desafio de hábito exige o hábito e a quantidade de dias.");
                }
                habitos.findByIdAndUsuarioId(r.habitoId(), usuarioId)
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Hábito não encontrado."));
            }
            case FINANCEIRA -> {
                if (r.categoriaId() == null) {
                    throw new RegraDeNegocioException("Desafio financeiro exige uma categoria.");
                }
                categorias.findByIdAndUsuarioId(r.categoriaId(), usuarioId)
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
            }
            case MANUAL -> { }
        }
    }

    private RegraPontuacao regraDe(UUID usuarioId) {
        return regras.findById(usuarioId).orElseGet(() -> regras.save(new RegraPontuacao(usuarioId)));
    }

    private int saldoPontos(UUID usuarioId) {
        return valor(lancamentos.saldo(usuarioId));
    }

    private int valor(Long soma) {
        return soma == null ? 0 : soma.intValue();
    }
}
