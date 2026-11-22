package com.organizacao.usuario;

import java.util.UUID;

public record UsuarioResposta(UUID id, String nome, String email) {
    public static UsuarioResposta de(Usuario u) {
        return new UsuarioResposta(u.getId(), u.getNome(), u.getEmail());
    }
}
