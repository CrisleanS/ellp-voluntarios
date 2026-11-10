package com.ellp.voluntarios.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AutorizacaoServiceTest {

    private final AutorizacaoService service = new AutorizacaoService();

    @Test
    void deve_permitir_admin_acessar_qualquer_voluntario() {
        Authentication admin = new UsernamePasswordAuthenticationToken(
                "admin", "token", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        assertTrue(service.podeAcessarVoluntario(admin, 999L));
    }

    @Test
    void deve_restringir_voluntario_ao_proprio_id() {
        Authentication voluntario = jwtAuth(Map.of("uid", 10L, "voluntarioId", 42L),
                "ROLE_VOLUNTARIO");

        assertTrue(service.podeAcessarVoluntario(voluntario, 42L));
        assertFalse(service.podeAcessarVoluntario(voluntario, 43L));
    }

    @Test
    void deve_negar_acesso_a_voluntario_sem_id_e_a_autenticacoes_invalidas() {
        Authentication semId = jwtAuth(Map.of("uid", 10L), "ROLE_VOLUNTARIO");
        Authentication semPerfil = jwtAuth(Map.of("voluntarioId", 42L), "ROLE_OUTRO");
        Authentication naoJwt = new UsernamePasswordAuthenticationToken("user", "token");
        Authentication anonimo = new UsernamePasswordAuthenticationToken("user", "token");
        ((UsernamePasswordAuthenticationToken) anonimo).setAuthenticated(false);

        assertFalse(service.podeAcessarVoluntario(null, 42L));
        assertFalse(service.podeAcessarVoluntario(anonimo, 42L));
        assertFalse(service.podeAcessarVoluntario(naoJwt, 42L));
        assertFalse(service.podeAcessarVoluntario(semPerfil, 42L));
        assertFalse(service.podeAcessarVoluntario(semId, 42L));
    }

    @Test
    void deve_autorizar_o_proprio_usuario_exceto_token_de_primeiro_acesso() {
        Authentication usuario = jwtAuth(Map.of("uid", 7L), "ROLE_ADMIN");
        Authentication primeiroAcesso = jwtAuth(
                Map.of("uid", 7L, "purpose", "first_access"), "ROLE_ADMIN");
        Authentication semId = jwtAuth(Map.of(), "ROLE_ADMIN");

        assertTrue(service.ehMesmoUsuario(usuario, 7L));
        assertFalse(service.ehMesmoUsuario(usuario, 8L));
        assertFalse(service.ehMesmoUsuario(primeiroAcesso, 7L));
        assertFalse(service.ehMesmoUsuario(semId, 7L));
        assertFalse(service.ehMesmoUsuario(null, 7L));
        assertFalse(service.ehMesmoUsuario(
                new UsernamePasswordAuthenticationToken("user", "token"), 7L));
    }

    @Test
    void deve_validar_token_e_id_do_primeiro_acesso() {
        Authentication tokenValido = jwtAuth(
                Map.of("uid", 7L, "purpose", "first_access"), "ROLE_VOLUNTARIO");
        Authentication tokenNormal = jwtAuth(Map.of("uid", 7L), "ROLE_VOLUNTARIO");
        Authentication tokenOutroId = jwtAuth(
                Map.of("uid", 8L, "purpose", "first_access"), "ROLE_VOLUNTARIO");

        assertTrue(service.podeDefinirSenhaPrimeiroAcesso(tokenValido, 7L));
        assertFalse(service.podeDefinirSenhaPrimeiroAcesso(tokenNormal, 7L));
        assertFalse(service.podeDefinirSenhaPrimeiroAcesso(tokenOutroId, 7L));
        assertFalse(service.podeDefinirSenhaPrimeiroAcesso(null, 7L));
    }

    private JwtAuthenticationToken jwtAuth(Map<String, Object> claims, String authority) {
        Jwt.Builder builder = Jwt.withTokenValue("token")
                .header("alg", "none")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .subject("voluntario@example.com");
        claims.forEach(builder::claim);
        Jwt jwt = builder.build();
        return new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority(authority)));
    }
}
