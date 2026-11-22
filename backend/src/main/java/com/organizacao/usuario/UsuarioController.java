package com.organizacao.usuario;

import com.organizacao.erro.CredenciaisInvalidasException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequestMapping("/api/me")
public class UsuarioController {

    private final UsuarioRepository usuarios;

    public UsuarioController(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @GetMapping
    public UsuarioResposta eu(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject()); // o id vem do token
        return usuarios.findById(id)
                .map(UsuarioResposta::de)
                .orElseThrow(CredenciaisInvalidasException::new);
    }
}