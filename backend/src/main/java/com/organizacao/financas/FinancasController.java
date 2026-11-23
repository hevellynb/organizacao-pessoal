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

@Tag(name = "Finanças")
@RestController
@RequestMapping("/api")
public class FinancasController {

    private final FinancasService service;

    public FinancasController(FinancasService service) { this.service = service; }

    // ---------- categorias ----------
    @GetMapping("/categorias")
    public List<CategoriaResposta> listarCategorias(@AuthenticationPrincipal Jwt jwt) {
        return service.listarCategorias(UsuarioAtual.id(jwt));
    }

    @PostMapping("/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResposta criarCategoria(@AuthenticationPrincipal Jwt jwt,
                                            @Valid @RequestBody CategoriaRequest req) {
        return service.criarCategoria(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/categorias/{id}")
    public CategoriaResposta atualizarCategoria(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                                @Valid @RequestBody CategoriaRequest req) {
        return service.atualizarCategoria(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirCategoria(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluirCategoria(UsuarioAtual.id(jwt), id);
    }

    // ---------- renda ----------
    @GetMapping("/renda")
    public RendaResposta renda(@AuthenticationPrincipal Jwt jwt,
                               @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        return service.renda(UsuarioAtual.id(jwt), mes);
    }

    @PutMapping("/renda/{mes}")
    public RendaResposta definirRenda(@AuthenticationPrincipal Jwt jwt,
                                      @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
                                      @Valid @RequestBody RendaRequest req) {
        return service.definirRenda(UsuarioAtual.id(jwt), mes, req.valor());
    }

    // ---------- despesas ----------
    @PostMapping("/despesas")
    @ResponseStatus(HttpStatus.CREATED)
    public DespesaResposta lancar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody DespesaRequest req) {
        return service.lancarDespesa(UsuarioAtual.id(jwt), req);
    }

    @GetMapping("/despesas")
    public List<DespesaResposta> listarDespesas(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
            @RequestParam(required = false) UUID categoriaId) {
        return service.listarDespesas(UsuarioAtual.id(jwt), mes, categoriaId);
    }

    @PutMapping("/despesas/{id}")
    public DespesaResposta atualizarDespesa(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                            @Valid @RequestBody DespesaRequest req) {
        return service.atualizarDespesa(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/despesas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirDespesa(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluirDespesa(UsuarioAtual.id(jwt), id);
    }

    // ---------- painel ----------
    @GetMapping("/financas/painel")
    public PainelResposta painel(@AuthenticationPrincipal Jwt jwt,
                                 @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        return service.painel(UsuarioAtual.id(jwt), mes);
    }
}