package com.organizacao.financas;

import com.organizacao.erro.RecursoNaoEncontradoException;
import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.DespesaRepository.TotalCategoria;
import com.organizacao.financas.FinancasDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinancasService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private record Padrao(String nome, TipoCategoria tipo, String orcamento) { }

    private static final List<Padrao> PADRAO = List.of(
            new Padrao("Economia", TipoCategoria.ECONOMIA, "250.00"),
            new Padrao("Transporte", TipoCategoria.COMUM, "100.00"),
            new Padrao("Alimentação fora", TipoCategoria.COMUM, "220.00"),
            new Padrao("Entretenimento e eventos", TipoCategoria.COMUM, "150.00"),
            new Padrao("Compras pessoais", TipoCategoria.COMUM, "120.00"),
            new Padrao("Fundo de recompensas", TipoCategoria.FUNDO_RECOMPENSAS, "100.00"),
            new Padrao("Imprevistos e margem livre", TipoCategoria.COMUM, "60.00"));

    private final CategoriaRepository categorias;
    private final RendaRepository rendas;
    private final DespesaRepository despesas;
    private final AporteService aportes;

    public FinancasService(CategoriaRepository categorias, RendaRepository rendas,
                           DespesaRepository despesas, AporteService aportes) {
        this.categorias = categorias;
        this.rendas = rendas;
        this.despesas = despesas;
        this.aportes = aportes;
    }

    // ================= categorias =================

    @Transactional
    public void criarCategoriasPadrao(UUID usuarioId) {
        int ordem = 1;
        for (Padrao p : PADRAO) {
            categorias.save(new CategoriaOrcamento(usuarioId, p.nome(), p.tipo(),
                    new BigDecimal(p.orcamento()), ordem++));
        }
    }

    @Transactional(readOnly = true)
    public List<CategoriaResposta> listarCategorias(UUID usuarioId) {
        return categorias.findByUsuarioIdOrderByOrdemAscNomeAsc(usuarioId)
                .stream().map(CategoriaResposta::de).toList();
    }

    @Transactional
    public CategoriaResposta criarCategoria(UUID usuarioId, CategoriaRequest r) {
        String nome = r.nome().trim();
        garantirNomeLivre(usuarioId, nome, null);
        int ordem = (int) categorias.countByUsuarioId(usuarioId) + 1;
        return CategoriaResposta.de(categorias.save(
                new CategoriaOrcamento(usuarioId, nome, TipoCategoria.COMUM, r.orcamentoMensal(), ordem)));
    }

    @Transactional
    public CategoriaResposta atualizarCategoria(UUID usuarioId, UUID id, CategoriaRequest r) {
        CategoriaOrcamento c = buscarCategoria(usuarioId, id);
        String nome = r.nome().trim();
        garantirNomeLivre(usuarioId, nome, id);
        c.atualizar(nome, r.orcamentoMensal());
        return CategoriaResposta.de(c);
    }

    @Transactional
    public void excluirCategoria(UUID usuarioId, UUID id) {
        CategoriaOrcamento c = buscarCategoria(usuarioId, id);
        if (c.getTipo() != TipoCategoria.COMUM) {
            throw new RegraDeNegocioException("Esta categoria é essencial para o sistema e não pode ser excluída.");
        }
        if (despesas.existsByCategoriaId(id)) {
            throw new RegraDeNegocioException("Existem despesas nesta categoria. Exclua ou mova as despesas antes.");
        }
        categorias.delete(c);
    }

    // ================= renda =================

    @Transactional(readOnly = true)
    public RendaResposta renda(UUID usuarioId, YearMonth mes) {
        return rendas.findFirstByUsuarioIdAndMesLessThanEqualOrderByMesDesc(usuarioId, mes.atDay(1))
                .map(r -> new RendaResposta(mes.toString(), r.getValor(), !r.getMes().equals(mes.atDay(1))))
                .orElse(new RendaResposta(mes.toString(), ZERO, false));
    }

    @Transactional
    public RendaResposta definirRenda(UUID usuarioId, YearMonth mes, BigDecimal valor) {
        RendaMensal r = rendas.findByUsuarioIdAndMes(usuarioId, mes.atDay(1))
                .orElseGet(() -> new RendaMensal(usuarioId, mes.atDay(1), valor));
        r.setValor(valor);
        rendas.save(r);
        return new RendaResposta(mes.toString(), valor, false);
    }

    // ================= despesas =================

    @Transactional
    public DespesaResposta lancarDespesa(UUID usuarioId, DespesaRequest r) {
        exigirCategoriaComum(buscarCategoria(usuarioId, r.categoriaId()));
        Despesa d = new Despesa(usuarioId, r.categoriaId(), r.descricao().trim(),
                r.valor(), r.data(), vazioParaNulo(r.observacao()));
        return DespesaResposta.de(despesas.save(d));
    }

    @Transactional
    public DespesaResposta atualizarDespesa(UUID usuarioId, UUID id, DespesaRequest r) {
        Despesa d = buscarDespesa(usuarioId, id);
        exigirCategoriaComum(buscarCategoria(usuarioId, d.getCategoriaId()));
        exigirCategoriaComum(buscarCategoria(usuarioId, r.categoriaId()));
        d.atualizar(r.categoriaId(), r.descricao().trim(), r.valor(), r.data(),
                vazioParaNulo(r.observacao()));
        return DespesaResposta.de(d);
    }

    @Transactional
    public void excluirDespesa(UUID usuarioId, UUID id) {
        Despesa d = buscarDespesa(usuarioId, id);
        exigirCategoriaComum(buscarCategoria(usuarioId, d.getCategoriaId()));
        despesas.delete(d);
    }

    @Transactional(readOnly = true)
    public List<DespesaResposta> listarDespesas(UUID usuarioId, YearMonth mes, UUID categoriaId) {
        List<Despesa> lista = (categoriaId == null)
                ? despesas.findByUsuarioIdAndDataBetweenOrderByDataDescCriadoEmDesc(
                usuarioId, mes.atDay(1), mes.atEndOfMonth())
                : despesas.findByUsuarioIdAndCategoriaIdAndDataBetweenOrderByDataDescCriadoEmDesc(
                usuarioId, categoriaId, mes.atDay(1), mes.atEndOfMonth());
        return lista.stream().map(DespesaResposta::de).toList();
    }

    // ================= usados pelo módulo de recompensas =================

    @Transactional(readOnly = true)
    public BigDecimal fundoRecompensasRestante(UUID usuarioId, YearMonth mes) {
        return aportes.saldoFundo(usuarioId, mes);
    }

    @Transactional
    public void lancarNoFundoDeRecompensas(UUID usuarioId, String descricao,
                                           BigDecimal valor, LocalDate data) {
        CategoriaOrcamento fundo = categorias
                .findFirstByUsuarioIdAndTipo(usuarioId, TipoCategoria.FUNDO_RECOMPENSAS)
                .orElseThrow(() -> new RegraDeNegocioException(
                        "Categoria 'Fundo de recompensas' não encontrada."));
        despesas.save(new Despesa(usuarioId, fundo.getId(), descricao, valor, data,
                "Resgate de recompensa"));
    }

    // ================= painel =================

    @Transactional(readOnly = true)
    public PainelResposta painel(UUID usuarioId, YearMonth mes) {
        List<CategoriaOrcamento> cats = categorias.findByUsuarioIdOrderByOrdemAscNomeAsc(usuarioId);
        Map<UUID, BigDecimal> gastos = despesas
                .totaisPorCategoria(usuarioId, mes.atDay(1), mes.atEndOfMonth()).stream()
                .collect(Collectors.toMap(TotalCategoria::getCategoriaId, TotalCategoria::getTotal));
        Map<DestinoAporte, BigDecimal> aportadoNoMes = aportes.totaisDoMes(usuarioId, mes);

        BigDecimal reservaPlanejada = ZERO;
        BigDecimal fundoPlanejado = ZERO;
        BigDecimal fundoGastoNoMes = ZERO;
        BigDecimal totalDespesas = ZERO;
        List<LinhaCategoria> linhas = new ArrayList<>();

        for (CategoriaOrcamento c : cats) {
            BigDecimal gasto = gastos.getOrDefault(c.getId(), ZERO);
            switch (c.getTipo()) {
                case ECONOMIA -> reservaPlanejada = c.getOrcamentoMensal();
                case FUNDO_RECOMPENSAS -> {
                    fundoPlanejado = c.getOrcamentoMensal();
                    fundoGastoNoMes = gasto;
                }
                case COMUM -> {
                    linhas.add(linha(c, gasto));
                    totalDespesas = totalDespesas.add(gasto);
                }
            }
        }

        BigDecimal reservaAportada = aportadoNoMes.getOrDefault(DestinoAporte.RESERVA, ZERO);
        BigDecimal fundoAportado = aportadoNoMes.getOrDefault(DestinoAporte.FUNDO, ZERO);
        BigDecimal renda = renda(usuarioId, mes).valor();

        BigDecimal disponivel = renda.subtract(reservaAportada).subtract(fundoAportado)
                .subtract(totalDespesas);
        BigDecimal aposMetas = renda
                .subtract(reservaPlanejada.max(reservaAportada))
                .subtract(fundoPlanejado.max(fundoAportado))
                .subtract(totalDespesas);

        BigDecimal totalOrcado = soma(cats.stream().map(CategoriaOrcamento::getOrcamentoMensal));

        return new PainelResposta(mes.toString(), renda, totalOrcado, totalDespesas,
                disponivel, aposMetas,
                new ReservaResumo(reservaPlanejada, reservaAportada, aportes.saldoReserva(usuarioId, mes)),
                new FundoResumo(fundoPlanejado, fundoAportado, fundoGastoNoMes,
                        aportes.saldoFundo(usuarioId, mes)),
                linhas);
    }

    // ================= apoio =================

    private LinhaCategoria linha(CategoriaOrcamento c, BigDecimal gasto) {
        BigDecimal orc = c.getOrcamentoMensal();
        int percentual = orc.signum() == 0
                ? (gasto.signum() > 0 ? 100 : 0)
                : gasto.multiply(BigDecimal.valueOf(100)).divide(orc, 0, RoundingMode.HALF_UP).intValue();
        return new LinhaCategoria(c.getId(), c.getNome(), c.getTipo(), orc, gasto,
                orc.subtract(gasto), gasto.compareTo(orc) > 0, percentual);
    }

    private BigDecimal soma(java.util.stream.Stream<BigDecimal> valores) {
        return valores.reduce(ZERO, BigDecimal::add);
    }

    private void exigirCategoriaComum(CategoriaOrcamento c) {
        if (c.getTipo() != TipoCategoria.COMUM) {
            throw new RegraDeNegocioException(
                    "A reserva e o fundo recebem aportes. O fundo só gasta por resgate de recompensa.");
        }
    }

    private CategoriaOrcamento buscarCategoria(UUID usuarioId, UUID id) {
        return categorias.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
    }

    private Despesa buscarDespesa(UUID usuarioId, UUID id) {
        return despesas.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Despesa não encontrada."));
    }

    private void garantirNomeLivre(UUID usuarioId, String nome, UUID idAtual) {
        categorias.findByUsuarioIdAndNomeIgnoreCase(usuarioId, nome)
                .filter(c -> !c.getId().equals(idAtual))
                .ifPresent(c -> { throw new RegraDeNegocioException("Já existe uma categoria com esse nome."); });
    }

    private String vazioParaNulo(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}