package com.organizacao;

import com.organizacao.bingo.BingoDtos.CelulaRequest;
import com.organizacao.bingo.BingoService;
import com.organizacao.bingo.TipoCelula;
import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.AporteService;
import com.organizacao.financas.DestinoAporte;
import com.organizacao.financas.FinancasDtos.AporteRequest;
import com.organizacao.financas.FinancasDtos.AporteResposta;
import com.organizacao.wishlist.StatusItem;
import com.organizacao.wishlist.WishlistDtos.ItemRequest;
import com.organizacao.wishlist.WishlistDtos.ItemResposta;
import com.organizacao.wishlist.WishlistDtos.ResgateResposta;
import com.organizacao.wishlist.WishlistService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResgateTest extends IntegracaoBase {

    @Autowired WishlistService wishlist;
    @Autowired BingoService bingo;
    @Autowired AporteService aportes;

    /** Completa a primeira linha do bingo: com a regra padrão, vale 1 ponto. */
    private void ganharUmPonto(UUID u) {
        for (int p = 0; p < 5; p++) {
            bingo.definirCelula(u, MES, p,
                    new CelulaRequest("Manual " + p, TipoCelula.MANUAL, null, null, null));
        }
        for (int p = 0; p < 5; p++) bingo.concluirManual(u, MES, p, true);
    }

    private ItemResposta item(UUID u, String nome, String preco, Integer pontos) {
        return wishlist.criar(u, new ItemRequest(nome, null, new BigDecimal(preco), pontos, null));
    }

    private AporteResposta aportarNoFundo(UUID u, String valor) {
        return aportes.registrar(u,
                new AporteRequest(DestinoAporte.FUNDO, new BigDecimal(valor), HOJE, null));
    }

    @ParameterizedTest
    @CsvSource({"25,1", "30,1", "60,2", "90,3", "91,4", "150,5"})
    void pontosSugeridosSeguemATabelaDoDocumento(String preco, int pontosEsperados) {
        UUID u = novoUsuario();
        assertThat(item(u, "Item", preco, null).pontosNecessarios()).isEqualTo(pontosEsperados);
    }

    @Test
    void semPontosNaoResgata() {
        UUID u = novoUsuario();
        aportarNoFundo(u, "100");
        ItemResposta caderno = item(u, "Caderno", "25", null);

        assertThatThrownBy(() -> wishlist.resgatar(u, caderno.id(), null))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("Pontos insuficientes");
    }

    @Test
    void semSaldoNoFundoNaoResgata() {
        UUID u = novoUsuario();
        ganharUmPonto(u);
        ItemResposta caderno = item(u, "Caderno", "25", null);

        assertThatThrownBy(() -> wishlist.resgatar(u, caderno.id(), null))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("saldo do fundo");
    }

    @Test
    void resgateDescontaOsPontosEOSaldoDoFundo() {
        UUID u = novoUsuario();
        ganharUmPonto(u);
        aportarNoFundo(u, "100");
        ItemResposta caderno = item(u, "Caderno", "25", null);

        ResgateResposta r = wishlist.resgatar(u, caderno.id(), null);

        assertThat(r.item().status()).isEqualTo(StatusItem.ADQUIRIDO);
        assertThat(r.pontosGastos()).isEqualTo(1);
        assertThat(r.saldoPontos()).isZero();
        assertThat(r.fundoDisponivel()).isEqualByComparingTo("75");
        assertThat(aportes.saldoFundo(u, MES)).isEqualByComparingTo("75");
        assertThat(bingo.saldo(u)).isZero();
    }

    @Test
    void resgateAceitaOValorRealmentePago() {
        UUID u = novoUsuario();
        ganharUmPonto(u);
        aportarNoFundo(u, "100");
        ItemResposta caderno = item(u, "Caderno", "25", null);

        ResgateResposta r = wishlist.resgatar(u, caderno.id(), new BigDecimal("30"));

        assertThat(r.valorLancado()).isEqualByComparingTo("30");
        assertThat(r.fundoDisponivel()).isEqualByComparingTo("70");
    }

    @Test
    void itemNaoPodeSerResgatadoDuasVezes() {
        UUID u = novoUsuario();
        ganharUmPonto(u);
        aportarNoFundo(u, "100");
        ItemResposta caderno = item(u, "Caderno", "25", null);
        wishlist.resgatar(u, caderno.id(), null);

        assertThatThrownBy(() -> wishlist.resgatar(u, caderno.id(), null))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("já foi adquirido");
    }

    @Test
    void saldoNegativoBloqueiaNovosResgates() {
        UUID u = novoUsuario();
        ganharUmPonto(u);
        aportarNoFundo(u, "100");
        ItemResposta a = item(u, "A", "10", 1);
        wishlist.resgatar(u, a.id(), null);       // gasta o único ponto

        bingo.concluirManual(u, MES, 0, false);   // desfaz a linha: o saldo fica em -1
        assertThat(bingo.saldo(u)).isEqualTo(-1);

        ItemResposta b = item(u, "B", "10", 1);
        assertThatThrownBy(() -> wishlist.resgatar(u, b.id(), null))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("Pontos insuficientes");
    }

    @Test
    void fundoAcumulaEntreMeses() {
        UUID u = novoUsuario();
        aportes.registrar(u, new AporteRequest(DestinoAporte.FUNDO, new BigDecimal("100"),
                MES.minusMonths(2).atDay(10), null));
        aportarNoFundo(u, "100");

        assertThat(aportes.saldoFundo(u, MES)).isEqualByComparingTo("200");
        assertThat(aportes.saldoFundo(u, MES.minusMonths(1))).isEqualByComparingTo("100");
    }

    @Test
    void aporteAcimaDoPlanejadoEAceito() {
        UUID u = novoUsuario();
        aportarNoFundo(u, "140"); // o orçamento padrão do fundo é 100

        assertThat(aportes.saldoFundo(u, MES)).isEqualByComparingTo("140");
    }

    @Test
    void aporteComDataFuturaERecusado() {
        UUID u = novoUsuario();
        assertThatThrownBy(() -> aportes.registrar(u,
                new AporteRequest(DestinoAporte.FUNDO, new BigDecimal("10"), HOJE.plusDays(1), null)))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void aporteQueJaFoiGastoNaoPodeSerExcluido() {
        UUID u = novoUsuario();
        ganharUmPonto(u);
        AporteResposta aporte = aportarNoFundo(u, "100");
        ItemResposta caderno = item(u, "Caderno", "25", null);
        wishlist.resgatar(u, caderno.id(), null); // o saldo do fundo cai para 75

        assertThatThrownBy(() -> aportes.excluir(u, aporte.id()))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("já gastou");
    }

    @Test
    void aporteQueNaoFoiGastoPodeSerExcluido() {
        UUID u = novoUsuario();
        AporteResposta aporte = aportarNoFundo(u, "100");

        aportes.excluir(u, aporte.id());

        assertThat(aportes.saldoFundo(u, MES)).isEqualByComparingTo("0");
    }
}
