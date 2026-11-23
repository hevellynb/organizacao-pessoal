package com.organizacao;

import com.organizacao.bingo.BingoDtos.CelulaRequest;
import com.organizacao.bingo.BingoService;
import com.organizacao.bingo.TipoCelula;
import com.organizacao.erro.RecursoNaoEncontradoException;
import com.organizacao.financas.AporteService;
import com.organizacao.financas.DestinoAporte;
import com.organizacao.financas.FinancasDtos.AporteRequest;
import com.organizacao.financas.FinancasDtos.AporteResposta;
import com.organizacao.financas.FinancasDtos.DespesaRequest;
import com.organizacao.financas.FinancasService;
import com.organizacao.habito.HabitoRequest;
import com.organizacao.habito.HabitoResposta;
import com.organizacao.habito.HabitoService;
import com.organizacao.wishlist.WishlistDtos.ItemRequest;
import com.organizacao.wishlist.WishlistDtos.ItemResposta;
import com.organizacao.wishlist.WishlistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IsolamentoTest extends com.organizacao.IntegracaoBase {

    @Autowired HabitoService habitos;
    @Autowired WishlistService wishlist;
    @Autowired AporteService aportes;
    @Autowired BingoService bingo;
    @Autowired FinancasService financas;

    @Test
    void habitoDeOutroUsuarioNaoEncontrado() {
        UUID a = novoUsuario();
        UUID b = novoUsuario();
        HabitoResposta habitoDeA = habitos.criar(a, new HabitoRequest("Ler", null, null, 10));

        assertThatThrownBy(() -> habitos.historico(b, habitoDeA.id()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> habitos.marcar(b, habitoDeA.id(), HOJE, true))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void itemDaWishlistDeOutroUsuarioNaoEncontrado() {
        UUID a = novoUsuario();
        UUID b = novoUsuario();
        ItemResposta itemDeA = wishlist.criar(a,
                new ItemRequest("Caderno", null, new BigDecimal("25"), null, null));

        assertThatThrownBy(() -> wishlist.resgatar(b, itemDeA.id(), null))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> wishlist.excluir(b, itemDeA.id()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void aporteDeOutroUsuarioNaoEncontrado() {
        UUID a = novoUsuario();
        UUID b = novoUsuario();
        AporteResposta aporteDeA = aportes.registrar(a,
                new AporteRequest(DestinoAporte.FUNDO, new BigDecimal("50"), HOJE, null));

        assertThatThrownBy(() -> aportes.excluir(b, aporteDeA.id()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void celulaDoBingoNaoAceitaHabitoDeOutroUsuario() {
        UUID a = novoUsuario();
        UUID b = novoUsuario();
        HabitoResposta habitoDeA = habitos.criar(a, new HabitoRequest("Ler", null, null, 10));

        assertThatThrownBy(() -> bingo.definirCelula(b, MES, 0,
                new CelulaRequest("Ler", TipoCelula.HABITO, habitoDeA.id(), 3, null)))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void despesaNaoAceitaCategoriaDeOutroUsuario() {
        UUID a = novoUsuario();
        UUID b = novoUsuario();
        UUID categoriaDeA = financas.listarCategorias(a).stream()
                .filter(c -> c.nome().equals("Transporte")).findFirst().orElseThrow().id();

        assertThatThrownBy(() -> financas.lancarDespesa(b,
                new DespesaRequest("Onibus", BigDecimal.TEN, categoriaDeA, HOJE, null)))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }
}
