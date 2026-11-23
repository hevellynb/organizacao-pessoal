package com.organizacao;

import com.organizacao.bingo.BingoDtos.CartelaResposta;
import com.organizacao.bingo.BingoDtos.CelulaRequest;
import com.organizacao.bingo.BingoDtos.LancamentoResposta;
import com.organizacao.bingo.BingoDtos.PontosResposta;
import com.organizacao.bingo.BingoDtos.RegrasRequest;
import com.organizacao.bingo.BingoService;
import com.organizacao.bingo.TipoCelula;
import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.AporteService;
import com.organizacao.financas.DestinoAporte;
import com.organizacao.financas.FinancasDtos.AporteRequest;
import com.organizacao.financas.FinancasDtos.DespesaRequest;
import com.organizacao.financas.FinancasService;
import com.organizacao.habito.HabitoRequest;
import com.organizacao.habito.HabitoResposta;
import com.organizacao.habito.HabitoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BingoPontuacaoTest extends IntegracaoBase {

    @Autowired BingoService bingo;
    @Autowired HabitoService habitos;
    @Autowired FinancasService financas;
    @Autowired AporteService aportes;

    private CelulaRequest manual(int p) {
        return new CelulaRequest("Manual " + p, TipoCelula.MANUAL, null, null, null);
    }

    private void definirManuais(UUID u, int quantidade) {
        for (int p = 0; p < quantidade; p++) bingo.definirCelula(u, MES, p, manual(p));
    }

    private void concluir(UUID u, int quantidade) {
        for (int p = 0; p < quantidade; p++) bingo.concluirManual(u, MES, p, true);
    }

    private UUID categoriaPorNome(UUID u, String nome) {
        return financas.listarCategorias(u).stream()
                .filter(c -> c.nome().equals(nome)).findFirst().orElseThrow().id();
    }

    @Test
    void linhaCompletaGeraUmPonto() {
        UUID u = novoUsuario();
        definirManuais(u, 5);
        concluir(u, 5);

        CartelaResposta c = bingo.obter(u, MES);
        assertThat(c.quantidadeLinhas()).isEqualTo(1);
        assertThat(c.pontosDoMes()).isEqualTo(1);
        assertThat(c.saldoPontos()).isEqualTo(1);
    }

    @Test
    void desmarcarDevolveOPontoEOHistoricoFicaNoExtrato() {
        UUID u = novoUsuario();
        definirManuais(u, 5);
        concluir(u, 5);
        bingo.concluirManual(u, MES, 2, false);

        PontosResposta extrato = bingo.extrato(u);
        assertThat(extrato.saldo()).isZero();
        assertThat(extrato.extrato()).extracting(LancamentoResposta::pontos)
                .containsExactlyInAnyOrder(1, -1);
    }

    @Test
    void cartelaCompletaGanhaOsPontosDasLinhasMaisOBonus() {
        UUID u = novoUsuario();
        definirManuais(u, 25);
        concluir(u, 25);

        CartelaResposta c = bingo.obter(u, MES);
        assertThat(c.cartelaCompleta()).isTrue();
        assertThat(c.quantidadeLinhas()).isEqualTo(12); // 5 linhas + 5 colunas + 2 diagonais
        assertThat(c.pontosDoMes()).isEqualTo(14);      // 12 x 1 + bônus de 2
    }

    @Test
    void regraDePontosEConfiguravel() {
        UUID u = novoUsuario();
        bingo.atualizarRegras(u, new RegrasRequest(10, 0));
        definirManuais(u, 5);
        concluir(u, 5);

        assertThat(bingo.obter(u, MES).pontosDoMes()).isEqualTo(10);
    }

    @Test
    void desafioDeHabitoConcluiSozinhoEDesfazAoDesmarcar() {
        UUID u = novoUsuario();
        HabitoResposta h = habitos.criar(u, new HabitoRequest("Caminhar", null, "30 min", 20));
        bingo.definirCelula(u, MES, 0,
                new CelulaRequest("Caminhar 1 dia", TipoCelula.HABITO, h.id(), 1, null));

        assertThat(bingo.obter(u, MES).celulas().get(0).concluida()).isFalse();
        habitos.marcar(u, h.id(), HOJE, true);
        assertThat(bingo.obter(u, MES).celulas().get(0).concluida()).isTrue();
        habitos.marcar(u, h.id(), HOJE, false);
        assertThat(bingo.obter(u, MES).celulas().get(0).concluida()).isFalse();
    }

    @Test
    void limiteDeGastoSoContaQuandoOMesTermina() {
        UUID u = novoUsuario();
        UUID transporte = categoriaPorNome(u, "Transporte");
        bingo.definirCelula(u, MES, 0,
                new CelulaRequest("Respeitar transporte", TipoCelula.FINANCEIRA, null, null, transporte));
        financas.lancarDespesa(u, new DespesaRequest("Onibus", new BigDecimal("20"), transporte, HOJE, null));

        var celula = bingo.obter(u, MES).celulas().get(0);
        assertThat(celula.regra()).isEqualTo("LIMITE_GASTO");
        assertThat(celula.concluida()).isFalse(); // o mês ainda está em andamento
    }

    @Test
    void metaDeAporteMedeOsAportesDoMes() {
        UUID u = novoUsuario();
        UUID economia = categoriaPorNome(u, "Economia");
        bingo.definirCelula(u, MES, 0,
                new CelulaRequest("Guardar na reserva", TipoCelula.FINANCEIRA, null, null, economia));

        assertThat(bingo.obter(u, MES).celulas().get(0).concluida()).isFalse();
        aportes.registrar(u, new AporteRequest(DestinoAporte.RESERVA, new BigDecimal("250"), HOJE, null));

        var celula = bingo.obter(u, MES).celulas().get(0);
        assertThat(celula.regra()).isEqualTo("META_APORTE");
        assertThat(celula.concluida()).isTrue(); // 250 aportados = 250 planejados
    }

    @Test
    void soDesafiosManuaisSaoMarcadosAMao() {
        UUID u = novoUsuario();
        HabitoResposta h = habitos.criar(u, new HabitoRequest("Ler", null, null, 10));
        bingo.definirCelula(u, MES, 0,
                new CelulaRequest("Ler 3 dias", TipoCelula.HABITO, h.id(), 3, null));

        assertThatThrownBy(() -> bingo.concluirManual(u, MES, 0, true))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void cartelaDeMesEncerradoNaoPodeSerAlterada() {
        UUID u = novoUsuario();
        assertThatThrownBy(() -> bingo.definirCelula(u, MES.minusMonths(1), 0, manual(0)))
                .isInstanceOf(RegraDeNegocioException.class);
    }
}
