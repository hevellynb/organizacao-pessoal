package com.organizacao.bingo;

import com.organizacao.pontos.TipoLancamento;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class BingoDtos {

    private BingoDtos() { }

    public record CelulaRequest(
            @NotBlank(message = "Informe o desafio.") @Size(max = 120) String titulo,
            @NotNull(message = "Informe o tipo do desafio.") TipoCelula tipo,
            UUID habitoId,
            @Min(value = 1, message = "A meta mínima é 1 dia.")
            @Max(value = 31, message = "A meta máxima é 31 dias.") Integer metaDias,
            UUID categoriaId) { }

    public record ConclusaoRequest(@NotNull(message = "Informe se foi concluída.") Boolean concluida) { }

    public record CelulaResposta(int posicao, boolean definida, String titulo, TipoCelula tipo,
                                 UUID habitoId, Integer metaDias, UUID categoriaId,
                                 boolean concluida, BigDecimal atual, BigDecimal meta,
                                 String unidade, String regra) {
        public static CelulaResposta vazia(int posicao) {
            return new CelulaResposta(posicao, false, null, null, null, null, null,
                    false, null, null, null, null);
        }
    }

    public record CartelaResposta(UUID id, String mes, boolean fechada,
                                  List<CelulaResposta> celulas,
                                  List<List<Integer>> linhasCompletas,
                                  int quantidadeLinhas, boolean cartelaCompleta,
                                  int pontosDoMes, int saldoPontos) { }

    public record LancamentoResposta(UUID id, TipoLancamento tipo, int pontos,
                                     String descricao, OffsetDateTime criadoEm) { }

    public record PontosResposta(int saldo, List<LancamentoResposta> extrato) { }

    public record RegrasRequest(
            @Min(value = 0, message = "Mínimo 0.") @Max(value = 100, message = "Máximo 100.") int pontosPorLinha,
            @Min(value = 0, message = "Mínimo 0.") @Max(value = 100, message = "Máximo 100.") int bonusCartela) { }

    public record RegrasResposta(int pontosPorLinha, int bonusCartela) { }
}
