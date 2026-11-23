package com.organizacao;

import com.organizacao.auth.AuthService;
import com.organizacao.auth.LoginRequest;
import com.organizacao.auth.RegistroRequest;
import com.organizacao.erro.CredenciaisInvalidasException;
import com.organizacao.erro.EmailJaCadastradoException;
import com.organizacao.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthTest extends IntegracaoBase {

    @Autowired AuthService auth;
    @Autowired UsuarioRepository usuarios;

    private String emailNovo() { return "auth-" + UUID.randomUUID() + "@teste.com"; }

    @Test
    void senhaEGuardadaCriptografada() {
        String email = emailNovo();
        auth.registrar(new RegistroRequest("Maria", email, "senha12345"));

        String hash = usuarios.findByEmail(email).orElseThrow().getSenhaHash();
        assertThat(hash).startsWith("$2").doesNotContain("senha12345");
    }

    @Test
    void emailRepetidoERecusadoMesmoComLetrasMaiusculas() {
        String email = emailNovo();
        auth.registrar(new RegistroRequest("Maria", email, "senha12345"));

        assertThatThrownBy(() ->
                auth.registrar(new RegistroRequest("Outra", email.toUpperCase(), "outrasenha1")))
                .isInstanceOf(EmailJaCadastradoException.class);
    }

    @Test
    void loginSoFuncionaComASenhaCerta() {
        String email = emailNovo();
        auth.registrar(new RegistroRequest("Maria", email, "senha12345"));

        assertThat(auth.login(new LoginRequest(email, "senha12345")).token()).isNotBlank();
        assertThatThrownBy(() -> auth.login(new LoginRequest(email, "senhaErrada1")))
                .isInstanceOf(CredenciaisInvalidasException.class);
    }
}
