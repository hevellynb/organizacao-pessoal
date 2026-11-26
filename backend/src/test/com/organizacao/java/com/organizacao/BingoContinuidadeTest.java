package com.organizacao;

import com.organizacao.bingo.BingoDtos.CartelaResposta;
import com.organizacao.bingo.BingoDtos.CelulaRequest;
import com.organizacao.bingo.BingoService;
import com.organizacao.bingo.Cartela;
import com.organizacao.bingo.CartelaRepository;
import com.organizacao.bingo.Celula;
import com.organizacao.bingo.CelulaRepository;
import com.organizacao.bingo.TipoCelula;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

class BingoContinuidadeTest extends IntegracaoBase {

    @Autowired BingoService bingo;
    @Autowired CartelaRepository cartelas;
    @Autowired CelulaRepository celulas;

    private CelulaRequest manual(String titulo) {
        return new CelulaRequest(titulo, TipoCelula.MANUAL, null, null, null);
    }

    @Test
    void mesSeguinteMostraAsMetasDoMesAtualSemMarcacoes() {
        UUID u = novoUsuario();
        bingo.definirCelula(u, MES, 0, manual("Meta A"));
        bingo.definirCelula(u, MES, 1, manual("Meta B"));
        bingo.concluirManual(u, MES, 0, true);

        CartelaResposta proximo = bingo.obter(u, MES.plusMonths(1));

        assertThat(proximo.id()).isNull(); // prévia: ainda não foi gravada
        assertThat(proximo.celulas().get(0).titulo()).isEqualTo("Meta A");
        assertThat(proximo.celulas().get(1).titulo()).isEqualTo("Meta B");
        assertThat(proximo.celulas().get(0).concluida()).isFalse(); // manuais recomeçam desmarcados
    }

    @Test
    void editarNoMesSeguinteCriaACartelaSemAlterarOMesAtual() {
        UUID u = novoUsuario();
        bingo.definirCelula(u, MES, 0, manual("Meta A"));
        bingo.definirCelula(u, MES, 1, manual("Meta B"));

        CartelaResposta proximo = bingo.definirCelula(u, MES.plusMonths(1), 0, manual("Meta A nova"));

        assertThat(proximo.id()).isNotNull();
        assertThat(proximo.celulas().get(0).titulo()).isEqualTo("Meta A nova");
        assertThat(proximo.celulas().get(1).titulo()).isEqualTo("Meta B"); // veio da cópia
        assertThat(bingo.obter(u, MES).celulas().get(0).titulo()).isEqualTo("Meta A"); // mês atual intacto
    }

    @Test
    void limparNoMesSeguinteNaoApagaDoMesAtual() {
        UUID u = novoUsuario();
        bingo.definirCelula(u, MES, 0, manual("Meta A"));
        bingo.definirCelula(u, MES, 1, manual("Meta B"));

        CartelaResposta proximo = bingo.limparCelula(u, MES.plusMonths(1), 0);

        assertThat(proximo.celulas().get(0).definida()).isFalse();
        assertThat(proximo.celulas().get(1).definida()).isTrue();
        assertThat(bingo.obter(u, MES).celulas().get(0).definida()).isTrue();
    }

    @Test
    void cartelaDoMesAtualNasceCopiadaDoMesAnterior() {
        UUID u = novoUsuario();
        Cartela anterior = cartelas.save(new Cartela(u, MES.minusMonths(1).atDay(1)));
        Celula celula = new Celula(anterior.getId(), (short) 0);
        celula.definir("Meta antiga", TipoCelula.MANUAL, null, null, null);
        celulas.save(celula);

        CartelaResposta atual = bingo.obter(u, MES);

        assertThat(atual.id()).isNotNull();
        assertThat(atual.celulas().get(0).titulo()).isEqualTo("Meta antiga");
        assertThat(atual.celulas().get(0).concluida()).isFalse();
    }
}
