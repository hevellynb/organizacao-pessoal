package com.organizacao;

import com.organizacao.auth.AuthService;
import com.organizacao.auth.RegistroRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.UUID;

@SpringBootTest
@Import(PostgresTestConfig.class)
@Transactional // cada teste é desfeito no final
public abstract class IntegracaoBase {

    protected static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");
    protected static final YearMonth MES = YearMonth.now(ZONA);
    protected static final LocalDate HOJE = LocalDate.now(ZONA);

    @Autowired
    private AuthService auth;

    /** Cadastra um usuário novo (já com as categorias padrão) e devolve o id dele. */
    protected UUID novoUsuario() {
        String email = "teste-" + UUID.randomUUID() + "@teste.com";
        return auth.registrar(new RegistroRequest("Usuario Teste", email, "senha12345"))
                .usuario().id();
    }
}
