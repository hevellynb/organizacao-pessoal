package com.organizacao.usuario;

import java.util.UUID;

public record UsuarioResposta(UUID id, String nome, String email, String apelido, String corDestaque) {
    public static UsuarioResposta de(Usuario u) {
        return new UsuarioResposta(u.getId(), u.getNome(), u.getEmail(), u.getApelido(), u.getCorDestaque());
    }
}