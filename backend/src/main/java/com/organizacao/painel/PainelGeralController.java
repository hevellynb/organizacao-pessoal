package com.organizacao.painel;

import com.organizacao.auth.UsuarioAtual;
import com.organizacao.painel.PainelGeralDtos.PainelGeralResposta;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.YearMonth;
import java.time.ZoneId;

@Tag(name = "Painel geral")
@RestController
@RequestMapping("/api/painel")
public class PainelGeralController {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    private final PainelGeralService service;

    public PainelGeralController(PainelGeralService service) { this.service = service; }

    @GetMapping
    public PainelGeralResposta obter(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        YearMonth alvo = mes != null ? mes : YearMonth.now(ZONA); // sem parâmetro: mês atual
        return service.obter(UsuarioAtual.id(jwt), alvo);
    }
}
