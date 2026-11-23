package com.organizacao.wishlist;

import com.organizacao.auth.UsuarioAtual;
import com.organizacao.wishlist.WishlistDtos.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name = "Wishlist e recompensas")
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService service;

    public WishlistController(WishlistService service) { this.service = service; }

    @GetMapping
    public WishlistResposta listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAtual.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResposta criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ItemRequest req) {
        return service.criar(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/{id}")
    public ItemResposta atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                  @Valid @RequestBody ItemRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluir(UsuarioAtual.id(jwt), id);
    }

    @PostMapping("/{id}/resgatar")
    public ResgateResposta resgatar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                    @Valid @RequestBody(required = false) ResgateRequest req) {
        return service.resgatar(UsuarioAtual.id(jwt), id, req == null ? null : req.precoPago());
    }
}
