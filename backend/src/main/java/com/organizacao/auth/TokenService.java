package com.organizacao.auth;

import com.organizacao.usuario.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {

    private final JwtEncoder encoder;
    private final long expiracaoHoras;

    public TokenService(JwtEncoder encoder,
                        @Value("${app.jwt.expiracao-horas}") long expiracaoHoras) {
        this.encoder = encoder;
        this.expiracaoHoras = expiracaoHoras;
    }

    public String gerar(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("organizacao-api")
                .issuedAt(agora)
                .expiresAt(agora.plus(expiracaoHoras, ChronoUnit.HOURS))
                .subject(usuario.getId().toString())   // quem é o dono do token
                .claim("email", usuario.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
