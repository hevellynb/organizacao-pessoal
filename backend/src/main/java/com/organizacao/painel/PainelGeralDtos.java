package com.organizacao.painel;

import com.organizacao.financas.FinancasDtos.PainelResposta;
import com.organizacao.wishlist.WishlistDtos.ItemResposta;
import java.util.List;

public final class PainelGeralDtos {

    private PainelGeralDtos() { }

    public record HabitosResumo(int habitos, int diasRealizados, int metaTotalDias, int percentual) { }

    public record BingoResumo(int celulasDefinidas, int celulasConcluidas, int linhas,
                              boolean cartelaCompleta, int pontosDoMes) { }

    public record PainelGeralResposta(String mes, HabitosResumo habitos, BingoResumo bingo,
                                      int saldoPontos, PainelResposta financas,
                                      List<ItemResposta> recompensasDisponiveis) { }
}
