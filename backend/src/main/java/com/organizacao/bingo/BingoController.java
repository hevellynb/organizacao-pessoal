package com.organizacao.bingo;

import com.organizacao.auth.UsuarioAtual;
import com.organizacao.bingo.BingoDtos.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.time.YearMonth;

@Tag(name = "Bingo e pontos")
@RestController
@RequestMapping("/api")
public class BingoController {

    private final BingoService service;

    public BingoController(BingoService service) { this.service = service; }

    @GetMapping("/bingo")
    public CartelaResposta obter(@AuthenticationPrincipal Jwt jwt,
                                 @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        return service.obter(UsuarioAtual.id(jwt), mes);
    }

    @PutMapping("/bingo/{mes}/celulas/{posicao}")
    public CartelaResposta definir(@AuthenticationPrincipal Jwt jwt,
                                   @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
                                   @PathVariable int posicao,
                                   @Valid @RequestBody CelulaRequest req) {
        return service.definirCelula(UsuarioAtual.id(jwt), mes, posicao, req);
    }

    @DeleteMapping("/bingo/{mes}/celulas/{posicao}")
    public CartelaResposta limpar(@AuthenticationPrincipal Jwt jwt,
                                  @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
                                  @PathVariable int posicao) {
        return service.limparCelula(UsuarioAtual.id(jwt), mes, posicao);
    }

    @PutMapping("/bingo/{mes}/celulas/{posicao}/conclusao")
    public CartelaResposta concluir(@AuthenticationPrincipal Jwt jwt,
                                    @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
                                    @PathVariable int posicao,
                                    @Valid @RequestBody ConclusaoRequest req) {
        return service.concluirManual(UsuarioAtual.id(jwt), mes, posicao, req.concluida());
    }

    @GetMapping("/pontos")
    public PontosResposta extrato(@AuthenticationPrincipal Jwt jwt) {
        return service.extrato(UsuarioAtual.id(jwt));
    }

    @GetMapping("/pontos/regras")
    public RegrasResposta regras(@AuthenticationPrincipal Jwt jwt) {
        return service.regras(UsuarioAtual.id(jwt));
    }

    @PutMapping("/pontos/regras")
    public RegrasResposta atualizarRegras(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody RegrasRequest req) {
        return service.atualizarRegras(UsuarioAtual.id(jwt), req);
    }
}
