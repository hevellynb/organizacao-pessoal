package com.organizacao.habito;

import com.organizacao.auth.UsuarioAtual;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habitos")
public class HabitoController {

    private final HabitoService service;

    public HabitoController(HabitoService service) { this.service = service; }

    @GetMapping
    public List<HabitoResposta> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAtual.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HabitoResposta criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody HabitoRequest req) {
        return service.criar(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/{id}")
    public HabitoResposta atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                    @Valid @RequestBody HabitoRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluir(UsuarioAtual.id(jwt), id);
    }

    @GetMapping("/dia")
    public List<HabitoDiaResposta> listaDoDia(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.listaDoDia(UsuarioAtual.id(jwt), data);
    }

    @PutMapping("/{id}/registros/{data}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                       @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
                       @Valid @RequestBody MarcacaoRequest req) {
        service.marcar(UsuarioAtual.id(jwt), id, data, req.feito());
    }

    @GetMapping("/resumo")
    public List<HabitoResumoMes> resumo(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        return service.resumo(UsuarioAtual.id(jwt), mes);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoMes> historico(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.historico(UsuarioAtual.id(jwt), id);
    }
}
