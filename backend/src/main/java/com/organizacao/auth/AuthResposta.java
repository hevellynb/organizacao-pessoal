package com.organizacao.auth;

import com.organizacao.usuario.UsuarioResposta;

public record AuthResposta(String token, UsuarioResposta usuario) { }
