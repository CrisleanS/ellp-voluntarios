package com.ellp.voluntarios.security;

import com.ellp.voluntarios.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final JwtEncoder jwtEncoder;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("ellp-voluntarios")
                .issuedAt(agora)
                .expiresAt(agora.plusMillis(expirationMs))
                .subject(usuario.getEmail())
                .claim("uid", usuario.getId())
                .claim("roles", List.of("ROLE_" + usuario.getTipo()));

        if (usuario.getVoluntarioId() != null) {
            claims.claim("voluntarioId", usuario.getVoluntarioId());
        }

        return jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims.build()
        )).getTokenValue();
    }

    public String gerarTokenPrimeiroAcesso(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("ellp-voluntarios")
                .issuedAt(agora)
                .expiresAt(agora.plus(Duration.ofMinutes(10)))
                .subject(usuario.getEmail())
                .claim("uid", usuario.getId())
                .claim("purpose", "first_access")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims
        )).getTokenValue();
    }
}
