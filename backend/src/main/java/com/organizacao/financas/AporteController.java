package com.organizacao.financas;

import com.organizacao.auth.UsuarioAtual;
import com.organizacao.financas.FinancasDtos.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Tag(name = "Aportes")
@RestController
@RequestMapping("/api/aportes")
public class AporteController {

    private final AporteService service;

    public AporteController(AporteService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AporteResposta registrar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AporteRequest req) {
        return service.registrar(UsuarioAtual.id(jwt), req);
    }

    @GetMapping
    public List<AporteResposta> listar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
            @RequestParam(required = false) DestinoAporte destino) {
        return service.listar(UsuarioAtual.id(jwt), mes, destino);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluir(UsuarioAtual.id(jwt), id);
    }
}