package com.organizacao.usuario;

import com.organizacao.auth.UsuarioAtual;
import com.organizacao.erro.CredenciaisInvalidasException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Usuário")
@RestController
@RequestMapping("/api/me")
public class UsuarioController {

    private final UsuarioRepository usuarios;
    private final UsuarioService service;

    public UsuarioController(UsuarioRepository usuarios, UsuarioService service) {
        this.usuarios = usuarios;
        this.service = service;
    }

    @GetMapping
    public UsuarioResposta eu(@AuthenticationPrincipal Jwt jwt) {
        return usuarios.findById(UsuarioAtual.id(jwt))
                .map(UsuarioResposta::de)
                .orElseThrow(CredenciaisInvalidasException::new);
    }

    @PutMapping("/preferencias")
    public UsuarioResposta atualizarPreferencias(@AuthenticationPrincipal Jwt jwt,
                                                 @Valid @RequestBody PreferenciasRequest req) {
        return service.atualizarPreferencias(UsuarioAtual.id(jwt), req);
    }
}