package com.organizacao.auth;

import com.organizacao.erro.CredenciaisInvalidasException;
import com.organizacao.erro.EmailJaCadastradoException;
import com.organizacao.financas.FinancasService;
import com.organizacao.usuario.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final RegraPontuacaoRepository regras;
    private final PasswordEncoder encoder;
    private final TokenService tokens;
    private final FinancasService financas;

    public AuthService(UsuarioRepository usuarios, RegraPontuacaoRepository regras,
                       PasswordEncoder encoder, TokenService tokens, FinancasService financas) {
        this.usuarios = usuarios;
        this.regras = regras;
        this.encoder = encoder;
        this.tokens = tokens;
        this.financas = financas;
    }

    @Transactional
    public AuthResposta registrar(RegistroRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarios.existsByEmail(email)) {
            throw new EmailJaCadastradoException();
        }
        Usuario u = usuarios.saveAndFlush(
                new Usuario(req.nome().trim(), email, encoder.encode(req.senha())));
        regras.save(new RegraPontuacao(u.getId()));
        financas.criarCategoriasPadrao(u.getId());
        return resposta(u);
    }

    @Transactional(readOnly = true)
    public AuthResposta login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        Usuario u = usuarios.findByEmail(email)
                .filter(x -> encoder.matches(req.senha(), x.getSenhaHash()))
                .orElseThrow(CredenciaisInvalidasException::new);
        return resposta(u);
    }

    private AuthResposta resposta(Usuario u) {
        return new AuthResposta(tokens.gerar(u), UsuarioResposta.de(u));
    }
}