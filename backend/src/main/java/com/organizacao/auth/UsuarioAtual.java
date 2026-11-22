package com.organizacao.auth;

import org.springframework.security.oauth2.jwt.Jwt;
import java.util.UUID;

public final class UsuarioAtual {
    private UsuarioAtual() { }

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
