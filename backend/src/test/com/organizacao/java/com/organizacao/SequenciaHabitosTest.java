package com.organizacao;

import com.organizacao.habito.HabitoRequest;
import com.organizacao.habito.HabitoResposta;
import com.organizacao.habito.HabitoService;
import com.organizacao.habito.SequenciaHabitos;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

class SequenciaHabitosTest extends IntegracaoBase {

    @Autowired HabitoService habitos;

    private HabitoResposta novoHabito(UUID u, String nome) {
        return habitos.criar(u, new HabitoRequest(nome, null, null, 20));
    }

    private void marcarDiasAtras(UUID u, HabitoResposta h, int... diasAtras) {
        for (int d : diasAtras) habitos.marcar(u, h.id(), HOJE.minusDays(d), true);
    }

    @Test
    void contaOsDiasSeguidosAteHoje() {
        UUID u = novoUsuario();
        marcarDiasAtras(u, novoHabito(u, "Ler"), 0, 1, 2);

        SequenciaHabitos s = habitos.sequencia(u);
        assertThat(s.atual()).isEqualTo(3);
        assertThat(s.hojeFeito()).isTrue();
        assertThat(s.melhor()).isEqualTo(3);
    }

    @Test
    void sequenciaContinuaSeHojeAindaNaoFoiFeito() {
        UUID u = novoUsuario();
        marcarDiasAtras(u, novoHabito(u, "Ler"), 1, 2);

        SequenciaHabitos s = habitos.sequencia(u);
        assertThat(s.atual()).isEqualTo(2);
        assertThat(s.hojeFeito()).isFalse();
    }

    @Test
    void falhaDeUmDiaQuebraASequenciaMasGuardaARecorde() {
        UUID u = novoUsuario();
        marcarDiasAtras(u, novoHabito(u, "Ler"), 0, 2, 3, 4); // ontem ficou sem nada

        SequenciaHabitos s = habitos.sequencia(u);
        assertThat(s.atual()).isEqualTo(1);
        assertThat(s.melhor()).isEqualTo(3);
    }

    @Test
    void varioHabitosNoMesmoDiaContamUmaVezSo() {
        UUID u = novoUsuario();
        marcarDiasAtras(u, novoHabito(u, "Ler"), 0);
        marcarDiasAtras(u, novoHabito(u, "Caminhar"), 0);

        assertThat(habitos.sequencia(u).atual()).isEqualTo(1);
    }

    @Test
    void diasDeOutrosUsuariosNaoEntramNaConta() {
        UUID a = novoUsuario();
        UUID b = novoUsuario();
        marcarDiasAtras(b, novoHabito(b, "Ler"), 0, 1, 2);

        SequenciaHabitos s = habitos.sequencia(a);
        assertThat(s.atual()).isZero();
        assertThat(s.melhor()).isZero();
    }
}