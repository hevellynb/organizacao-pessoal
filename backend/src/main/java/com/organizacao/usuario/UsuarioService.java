package com.organizacao.usuario;

import com.organizacao.erro.CredenciaisInvalidasException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;

    public UsuarioService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Transactional
    public UsuarioResposta atualizarPreferencias(UUID usuarioId, PreferenciasRequest r) {
        Usuario u = usuarios.findById(usuarioId).orElseThrow(CredenciaisInvalidasException::new);
        String apelido = (r.apelido() == null || r.apelido().isBlank()) ? null : r.apelido().trim();
        u.atualizarPreferencias(apelido, r.corDestaque());
        return UsuarioResposta.de(u);
    }
}