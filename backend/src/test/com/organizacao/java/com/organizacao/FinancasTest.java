package com.organizacao;

import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.AporteService;
import com.organizacao.financas.CategoriaOrcamento;
import com.organizacao.financas.DestinoAporte;
import com.organizacao.financas.FinancasDtos.AporteRequest;
import com.organizacao.financas.FinancasDtos.CategoriaResposta;
import com.organizacao.financas.FinancasDtos.DespesaRequest;
import com.organizacao.financas.FinancasDtos.LinhaCategoria;
import com.organizacao.financas.FinancasDtos.PainelResposta;
import com.organizacao.financas.FinancasService;
import com.organizacao.financas.TipoCategoria;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FinancasTest extends IntegracaoBase {

    @Autowired FinancasService financas;
    @Autowired AporteService aportes;

    private UUID categoriaPorNome(UUID u, String nome) {
        return financas.listarCategorias(u).stream()
                .filter(c -> c.nome().equals(nome)).findFirst().orElseThrow().id();
    }

    private UUID categoriaPorTipo(UUID u, TipoCategoria tipo) {
        return financas.listarCategorias(u).stream()
                .filter(c -> c.tipo() == tipo).findFirst().orElseThrow().id();
    }

    private void gastar(UUID u, String categoria, String valor) {
        financas.lancarDespesa(u, new DespesaRequest("Gasto", new BigDecimal(valor),
                categoriaPorNome(u, categoria), HOJE, null));
    }

    @Test
    void contaNovaTemAsSeteCategoriasPadraoSomandoMilReais() {
        UUID u = novoUsuario();

        var categorias = financas.listarCategorias(u);
        assertThat(categorias).hasSize(7);
        BigDecimal total = categorias.stream().map(CategoriaResposta::orcamentoMensal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(total).isEqualByComparingTo("1000");
    }

    @Test
    void despesaNaReservaOuNoFundoERecusada() {
        UUID u = novoUsuario();
        UUID economia = categoriaPorTipo(u, TipoCategoria.ECONOMIA);
        UUID fundo = categoriaPorTipo(u, TipoCategoria.FUNDO_RECOMPENSAS);

        assertThatThrownBy(() -> financas.lancarDespesa(u,
                new DespesaRequest("Teste", BigDecimal.TEN, economia, HOJE, null)))
                .isInstanceOf(RegraDeNegocioException.class);
        assertThatThrownBy(() -> financas.lancarDespesa(u,
                new DespesaRequest("Teste", BigDecimal.TEN, fundo, HOJE, null)))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void rendaDoMesAnteriorValeAteQueSeDefinaOutra() {
        UUID u = novoUsuario();
        financas.definirRenda(u, MES.minusMonths(1), new BigDecimal("1000"));

        var renda = financas.renda(u, MES);
        assertThat(renda.valor()).isEqualByComparingTo("1000");
        assertThat(renda.herdada()).isTrue();
    }

    @Test
    void semAportesOSaldoDisponivelNaoDescontaAsMetas() {
        UUID u = novoUsuario();
        financas.definirRenda(u, MES, new BigDecimal("1500"));
        gastar(u, "Transporte", "50");

        PainelResposta p = financas.painel(u, MES);
        assertThat(p.saldoDisponivel()).isEqualByComparingTo("1450");  // 1500 - 50
        assertThat(p.saldoAposMetas()).isEqualByComparingTo("1100");   // 1500 - 250 - 100 - 50
    }

    @Test
    void aportesReduzemOSaldoDisponivel() {
        UUID u = novoUsuario();
        financas.definirRenda(u, MES, new BigDecimal("1500"));
        gastar(u, "Transporte", "50");
        aportes.registrar(u, new AporteRequest(DestinoAporte.RESERVA, new BigDecimal("250"), HOJE, null));
        aportes.registrar(u, new AporteRequest(DestinoAporte.FUNDO, new BigDecimal("150"), HOJE, null));

        PainelResposta p = financas.painel(u, MES);
        assertThat(p.saldoDisponivel()).isEqualByComparingTo("1050");  // 1500 - 250 - 150 - 50
        assertThat(p.saldoAposMetas()).isEqualByComparingTo("1050");   // aportes já superam as metas
        assertThat(p.reserva().acumulado()).isEqualByComparingTo("250");
        assertThat(p.fundo().saldo()).isEqualByComparingTo("150");
    }

    @Test
    void categoriaQueUltrapassaOLimiteFicaMarcadaComoEstourada() {
        UUID u = novoUsuario();
        gastar(u, "Transporte", "150"); // o limite padrão é 100

        LinhaCategoria linha = financas.painel(u, MES).categorias().stream()
                .filter(l -> l.nome().equals("Transporte")).findFirst().orElseThrow();
        assertThat(linha.estourou()).isTrue();
        assertThat(linha.restante()).isEqualByComparingTo("-50");
    }

    @Test
    void listaDoPainelTrazSoCategoriasComuns() {
        UUID u = novoUsuario();

        var categorias = financas.painel(u, MES).categorias();
        assertThat(categorias).hasSize(5);
        assertThat(categorias).allMatch(l -> l.tipo() == TipoCategoria.COMUM);
    }
}
