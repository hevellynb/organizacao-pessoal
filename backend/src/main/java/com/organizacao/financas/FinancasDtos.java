package com.organizacao.financas;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class FinancasDtos {

    private FinancasDtos() { }

    // ---------- categorias ----------
    public record CategoriaRequest(
            @NotBlank(message = "Informe o nome da categoria.") @Size(max = 80) String nome,
            @NotNull(message = "Informe o orçamento mensal.")
            @DecimalMin(value = "0.00", message = "O orçamento não pode ser negativo.")
            @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais.") BigDecimal orcamentoMensal) { }

    public record CategoriaResposta(UUID id, String nome, TipoCategoria tipo,
                                    BigDecimal orcamentoMensal, int ordem) {
        public static CategoriaResposta de(CategoriaOrcamento c) {
            return new CategoriaResposta(c.getId(), c.getNome(), c.getTipo(),
                    c.getOrcamentoMensal(), c.getOrdem());
        }
    }

    // ---------- renda ----------
    public record RendaRequest(
            @NotNull(message = "Informe o valor da renda.")
            @DecimalMin(value = "0.00", message = "A renda não pode ser negativa.")
            @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais.") BigDecimal valor) { }

    public record RendaResposta(String mes, BigDecimal valor, boolean herdada) { }

    // ---------- despesas ----------
    public record DespesaRequest(
            @NotBlank(message = "Informe a descrição.") @Size(max = 160) String descricao,
            @NotNull(message = "Informe o valor.")
            @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
            @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais.") BigDecimal valor,
            @NotNull(message = "Informe a categoria.") UUID categoriaId,
            @NotNull(message = "Informe a data.") LocalDate data,
            @Size(max = 300) String observacao) { }

    public record DespesaResposta(UUID id, String descricao, BigDecimal valor,
                                  UUID categoriaId, LocalDate data, String observacao) {
        public static DespesaResposta de(Despesa d) {
            return new DespesaResposta(d.getId(), d.getDescricao(), d.getValor(),
                    d.getCategoriaId(), d.getData(), d.getObservacao());
        }
    }

    // ---------- aportes ----------
    public record AporteRequest(
            @NotNull(message = "Informe o destino (RESERVA ou FUNDO).") DestinoAporte destino,
            @NotNull(message = "Informe o valor.")
            @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
            @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais.") BigDecimal valor,
            @NotNull(message = "Informe a data.") LocalDate data,
            @Size(max = 300) String observacao) { }

    public record AporteResposta(UUID id, DestinoAporte destino, BigDecimal valor,
                                 LocalDate data, String observacao) {
        public static AporteResposta de(Aporte a) {
            return new AporteResposta(a.getId(), a.getDestino(), a.getValor(),
                    a.getData(), a.getObservacao());
        }
    }

    // ---------- painel ----------
    public record LinhaCategoria(UUID id, String nome, TipoCategoria tipo, BigDecimal orcamento,
                                 BigDecimal gasto, BigDecimal restante, boolean estourou, int percentual) { }

    public record ReservaResumo(BigDecimal planejado, BigDecimal aportadoNoMes, BigDecimal acumulado) { }

    public record FundoResumo(BigDecimal planejado, BigDecimal aportadoNoMes,
                              BigDecimal gastoNoMes, BigDecimal saldo) { }

    public record PainelResposta(String mes, BigDecimal renda, BigDecimal totalOrcado,
                                 BigDecimal totalDespesas, BigDecimal saldoDisponivel,
                                 BigDecimal saldoAposMetas, ReservaResumo reserva,
                                 FundoResumo fundo, List<LinhaCategoria> categorias) { }
}