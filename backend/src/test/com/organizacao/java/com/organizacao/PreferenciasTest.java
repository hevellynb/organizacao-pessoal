package com.organizacao;

import com.organizacao.usuario.PreferenciasRequest;
import com.organizacao.usuario.UsuarioRepository;
import com.organizacao.usuario.UsuarioResposta;
import com.organizacao.usuario.UsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

class PreferenciasTest extends IntegracaoBase {

    @Autowired UsuarioService servico;
    @Autowired UsuarioRepository usuarios;

    @Test
    void contaNovaTemACorPadrao() {
        UUID u = novoUsuario();

        assertThat(usuarios.findById(u).orElseThrow().getCorDestaque()).isEqualTo("violet");
        assertThat(usuarios.findById(u).orElseThrow().getApelido()).isNull();
    }

    @Test
    void salvaApelidoECorRemovendoEspacos() {
        UUID u = novoUsuario();

        UsuarioResposta resposta = servico.atualizarPreferencias(u, new PreferenciasRequest("  Hevi  ", "pink"));

        assertThat(resposta.apelido()).isEqualTo("Hevi");
        assertThat(resposta.corDestaque()).isEqualTo("pink");
        assertThat(usuarios.findById(u).orElseThrow().getCorDestaque()).isEqualTo("pink");
    }

    @Test
    void apelidoEmBrancoViraVazio() {
        UUID u = novoUsuario();

        UsuarioResposta resposta = servico.atualizarPreferencias(u, new PreferenciasRequest("   ", "blue"));

        assertThat(resposta.apelido()).isNull();
    }
}