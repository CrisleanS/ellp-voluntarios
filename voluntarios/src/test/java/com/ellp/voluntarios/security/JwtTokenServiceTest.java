package com.ellp.voluntarios.security;

import com.ellp.voluntarios.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JwtTokenServiceTest {

    private JwtEncoder encoder;
    private JwtTokenService service;

    @BeforeEach
    void setUp() {
        encoder = mock(JwtEncoder.class);
        service = new JwtTokenService(encoder);
        ReflectionTestUtils.setField(service, "expirationMs", 3_600_000L);
        when(encoder.encode(any())).thenAnswer(invocation -> {
            JwtEncoderParameters parameters = invocation.getArgument(0);
            Instant issuedAt = parameters.getClaims().getIssuedAt();
            Instant expiresAt = parameters.getClaims().getExpiresAt();
            return Jwt.withTokenValue("encoded-token")
                    .header("alg", "HS256")
                    .issuedAt(issuedAt)
                    .expiresAt(expiresAt)
                    .claims(claims -> claims.putAll(parameters.getClaims().getClaims()))
                    .build();
        });
    }

    @Test
    void deve_criar_token_de_sessao_com_role_e_id_do_voluntario() {
        Usuario usuario = Usuario.builder()
                .id(12L)
                .email("voluntario@example.com")
                .tipo("VOLUNTARIO")
                .voluntarioId(34L)
                .build();

        assertEquals("encoded-token", service.gerarToken(usuario));

        var captor = org.mockito.ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(encoder).encode(captor.capture());
        var claims = captor.getValue().getClaims();
        assertEquals("ellp-voluntarios", claims.getClaims().get("iss"));
        assertEquals("voluntario@example.com", claims.getSubject());
        assertEquals(Long.valueOf(12L), claims.getClaim("uid"));
        assertEquals(List.of("ROLE_VOLUNTARIO"), claims.getClaim("roles"));
        assertEquals(Long.valueOf(34L), claims.getClaim("voluntarioId"));
        assertEquals(3_600_000L,
                claims.getExpiresAt().toEpochMilli() - claims.getIssuedAt().toEpochMilli());
        assertEquals("HS256", captor.getValue().getJwsHeader().getAlgorithm().getName());
    }

    @Test
    void deve_omitir_id_do_voluntario_para_admin() {
        Usuario admin = Usuario.builder()
                .id(1L)
                .email("admin@example.com")
                .tipo("ADMIN")
                .build();

        service.gerarToken(admin);

        var captor = org.mockito.ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(encoder).encode(captor.capture());
        assertFalse(captor.getValue().getClaims().hasClaim("voluntarioId"));
        assertEquals(List.of("ROLE_ADMIN"), captor.getValue().getClaims().getClaim("roles"));
    }

    @Test
    void deve_criar_token_temporario_de_primeiro_acesso_sem_roles() {
        Usuario usuario = Usuario.builder()
                .id(12L)
                .email("voluntario@example.com")
                .tipo("VOLUNTARIO")
                .build();

        service.gerarTokenPrimeiroAcesso(usuario);

        var captor = org.mockito.ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(encoder).encode(captor.capture());
        var claims = captor.getValue().getClaims();
        assertEquals("first_access", claims.getClaim("purpose"));
        assertEquals(Long.valueOf(12L), claims.getClaim("uid"));
        assertFalse(claims.hasClaim("roles"));
        assertEquals(600_000L, claims.getExpiresAt().toEpochMilli() - claims.getIssuedAt().toEpochMilli());
        assertEquals("HS256", captor.getValue().getJwsHeader().getAlgorithm().getName());
    }
}
